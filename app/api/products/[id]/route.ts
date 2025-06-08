import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';

/**
 * Handles GET requests to retrieve a single product by ID.
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response with the product data or an error.
 */
export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect(); // Ensure database connection
  const { id } = context.params; // Get product ID from dynamic route

  try {
    // Find product by ID
    const product: IProduct | null = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an existing product by ID.
 * Requires admin authentication.
 * @param {Request} req - The incoming request object with updated product data.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response with the updated product or an error.
 */
export async function PUT(req: Request, context: { params: { id: string } }) {
  await dbConnect(); // Ensure database connection
  const { id } = context.params; // Get product ID from dynamic route

  const { userId, sessionClaims } = auth(); // Get authentication details from Clerk

  // Check if user is authenticated and has 'admin' role
  if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const body = await req.json(); // Parse the request body
    // Find and update the product. `new: true` returns the updated document.
    const product: IProduct | null = await Product.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose schema validators on update
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating product with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: error.message },
      { status: 400 } // Bad request for validation errors
    );
  }
}

/**
 * Handles DELETE requests to delete a product by ID.
 * Requires admin authentication.
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response indicating success or an error.
 */
export async function DELETE(req: Request, context: { params: { id: string } }) {
  await dbConnect(); // Ensure database connection
  const { id } = context.params; // Get product ID from dynamic route

  const { userId, sessionClaims } = auth(); // Get authentication details from Clerk

  // Check if user is authenticated and has 'admin' role
  if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    // Find and delete the product
    const deletedProduct: IProduct | null = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting product with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product', error: error.message },
      { status: 500 }
    );
  }
}
