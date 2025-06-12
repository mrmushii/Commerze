// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review'; // Import the Review model
import { IReview } from '@/lib/type'; // Import the IReview interface

/**
 * Handles GET requests to retrieve recent customer reviews across all products.
 * This API is used for testimonials sections, etc.
 *
 * Query Parameters:
 * - `limit`: Number of reviews to return (default: 5)
 *
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} A JSON response containing recent reviews or an error.
 */
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5'); // Default to 5 reviews

    // Fetch reviews sorted by creation date in descending order (newest first)
    // You might want to add criteria like `isVerified: true` if you moderate reviews.
    const reviews: IReview[] = await Review.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit);

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching recent reviews:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch recent reviews: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
