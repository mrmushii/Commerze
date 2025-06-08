import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Import auth
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type'; // Corrected import path for IProduct

/**
 * Define a custom type for Clerk's sessionClaims to ensure 'metadata' and 'role' are recognized.
 * This extends the default SessionClaims type from Clerk to include our custom publicMetadata.
 */
interface CustomSessionClaims {
  metadata?: {
    role?: string; // Make role optional as it might not always be present
  };
}

/**
 * Handles GET requests to retrieve all products.
 * @returns {NextResponse} A JSON response containing the list of products or an error message.
 */
export async function GET() {
  await dbConnect(); // Ensure database connection is established

  try {
    // Fetch all products from the database
    const products: IProduct[] = await Product.find({});
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: any) {
    // Handle errors during fetching
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new product.
 * Requires admin authentication.
 * @param {Request} req - The incoming request object containing product data in the body.
 * @returns {NextResponse} A JSON response with the created product or an error message.
 */
export async function POST(req: Request) {
  await dbConnect(); // Ensure database connection is established

  const { userId, sessionClaims } = await auth(); // Get authentication details from Clerk

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  // Check if user is authenticated and has 'admin' role
  if (!userId || claims?.metadata?.role !== 'admin') { // Corrected access to role via 'claims'
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json(); // Parse the request body
    // Create a new product document in the database
    const product: IProduct = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    // Handle validation or database errors
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product', error: error.message },
      { status: 400 } // Bad request for validation errors
    );
  }
}
