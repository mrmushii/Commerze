// app/api/upload/route.ts
// This API route handles multipart file uploads.
// FOR PRODUCTION: REPLACE WITH CLOUD STORAGE (AWS S3, Cloudinary, etc.) INTEGRATION.
// Storing directly on server/Vercel public directory is ephemeral.

import { NextResponse } from 'next/server';
import { writeFile, rm } from 'fs/promises'; // For writing/deleting files
import path from 'path';
import os from 'os'; // For temporary directory

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handles POST requests for image uploads.
 * This function processes multipart/form-data, saves images temporarily,
 * and returns their public URLs.
 *
 * @param {Request} req - The incoming request object containing image files.
 * @returns {NextResponse} A JSON response with the URLs of the uploaded images.
 */
export async function POST(req: Request) {
  try {
    // Check if the request is a multipart form data
    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, message: 'Invalid content type. Expected multipart/form-data.' }, { status: 400 });
    }

    const formData = await req.formData();
    const uploadedFileUrls: string[] = [];
    const filesToCleanUp: string[] = []; // Track files for cleanup

    // Loop through all files in the form data
    for (const [key, value] of formData.entries()) {
      // Check if the value is a File object
      if (value instanceof File) {
        const file = value;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create a unique filename to prevent collisions
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        // Define the temporary directory to save the file
        // In a real production server, this would be a secure, persistent storage.
        // For local dev, a public/uploads or a temp OS directory works.
        const uploadDir = path.join(process.cwd(), 'public', 'uploads'); // Save to public/uploads in your project
        // Ensure the directory exists
        try {
          await require('fs').promises.mkdir(uploadDir, { recursive: true });
        } catch (dirError) {
          console.error('Failed to create upload directory:', dirError);
          return NextResponse.json({ success: false, message: 'Server error: Could not create upload directory.' }, { status: 500 });
        }
        
        const filePath = path.join(uploadDir, filename);

        try {
          await writeFile(filePath, buffer);
          // Construct the public URL for the saved image
          const publicUrl = `/uploads/${filename}`;
          uploadedFileUrls.push(publicUrl);
          filesToCleanUp.push(filePath); // Add to cleanup list
        } catch (writeError: unknown) {
          console.error(`Failed to write file ${filename}:`, writeError);
          return NextResponse.json({ success: false, message: `Failed to upload image: ${file.name}` }, { status: 500 });
        }
      }
    }

    if (uploadedFileUrls.length === 0) {
      return NextResponse.json({ success: false, message: 'No image files uploaded.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, urls: uploadedFileUrls }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error handling image upload:', error);
    return NextResponse.json(
      { success: false, message: `Server error during upload: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
