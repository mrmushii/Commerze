// app/api/upload/route.ts
// This API route handles multipart file uploads.
// FOR PRODUCTION: INTEGRATE WITH CLOUD STORAGE (e.g., Cloudinary, AWS S3)
// Storing directly on server/Vercel public directory is ephemeral and will not persist.

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary SDK

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false, // Required for reading raw body as FormData
  },
};

/**
 * Handles POST requests for image uploads to Cloudinary.
 * This function processes multipart/form-data, uploads images to Cloudinary,
 * and returns their secure URLs.
 *
 * @param {Request} req - The incoming request object containing image files.
 * @returns {NextResponse} A JSON response with the secure URLs of the uploaded images.
 */
export async function POST(req: Request) {
  try {
    // Check if the request is a multipart form data
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      console.error('Upload API: Invalid content type. Expected multipart/form-data.');
      return NextResponse.json({ success: false, message: 'Invalid content type. Expected multipart/form-data.' }, { status: 400 });
    }

    const formData = await req.formData();
    const uploadedFileUrls: string[] = [];

    console.log('Upload API: Received FormData. Processing files...');

    // Loop through all files in the form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const file = value;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Convert buffer to base64 string for Cloudinary upload
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        console.log(`Upload API: Attempting to upload file: ${file.name} (Size: ${file.size} bytes) to Cloudinary.`);

        try {
          // Upload the image to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: 'ecommerce_products', // Optional: specify a folder in Cloudinary
            // You can add more options here, like transformations, quality settings etc.
          });

          // Cloudinary returns a secure_url for the uploaded image
          uploadedFileUrls.push(uploadResult.secure_url);
          console.log(`Upload API: Successfully uploaded ${file.name}. URL: ${uploadResult.secure_url}`);

        } catch (uploadError: unknown) {
          console.error(`Upload API: Failed to upload file ${file.name} to Cloudinary:`, uploadError);
          // If a single file upload fails, you might want to return an error or skip it.
          // For now, we'll return an error for the first failure.
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
