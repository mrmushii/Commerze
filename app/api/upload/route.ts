import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      console.error('Upload API: Invalid content type. Expected multipart/form-data.');
      return NextResponse.json({ success: false, message: 'Invalid content type. Expected multipart/form-data.' }, { status: 400 });
    }

    const formData = await req.formData();
    const uploadedFileUrls: string[] = [];

    console.log('Upload API: Received FormData. Processing files...');

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const file = value;
        const buffer = Buffer.from(await file.arrayBuffer());

        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        console.log(`Upload API: Attempting to upload file: ${file.name} (Size: ${file.size} bytes) to Cloudinary.`);

        try {
          const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: 'ecommerce_products',
          });

          uploadedFileUrls.push(uploadResult.secure_url);
          console.log(`Upload API: Successfully uploaded ${file.name}. URL: ${uploadResult.secure_url}`);

        } catch (uploadError: unknown) {
          console.error(`Upload API: Failed to upload file ${file.name} to Cloudinary:`, uploadError);
          return NextResponse.json({ success: false, message: `Failed to upload image ${file.name}.` }, { status: 500 });
        }
      }
    }

    if (uploadedFileUrls.length === 0) {
      console.warn('Upload API: No image files found in the upload request.');
      return NextResponse.json({ success: false, message: 'No image files uploaded.' }, { status: 400 });
    }

    console.log('Upload API: All files processed. Returning URLs:', uploadedFileUrls);
    return NextResponse.json({ success: true, urls: uploadedFileUrls }, { status: 200 });

  } catch (error: unknown) {
    console.error('Upload API: Top-level error handling image upload:', error);
    return NextResponse.json(
      { success: false, message: `Server error during upload: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
