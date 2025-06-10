import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';

/**
 * Handles GET requests for new arrival products.
 * Fetches products sorted by their creation date in descending order (newest first).
 *
 * Query Parameters:
 * - `limit`: Number of new arrival products to return (default: 8)
 *
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} A JSON response containing new arrival products or an error.
 */
export async function GET(req: Request) {
  await dbConnect(); // Ensure database connection

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8'); // Default to 8 new arrivals

    // Fetch products sorted by 'createdAt' in descending order (newest first)
    const newArrivals: IProduct[] = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(limit); // Limit the number of results

    return NextResponse.json({ success: true, data: newArrivals }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch new arrivals: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
