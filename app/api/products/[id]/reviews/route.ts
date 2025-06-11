// app/api/products/[id]/reviews/route.ts
import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server'; // Import auth and clerkClient
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review'; // Import the new Review model
import Product from '@/models/Products'; // Import Product model to update rating
import { IReview, IProduct } from '@/lib/type'; // Import IReview and IProduct types
import mongoose from 'mongoose';

/**
 * Handles GET requests to retrieve all reviews for a specific product.
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains dynamic route parameters (params.id).
 * @returns {NextResponse} A JSON response containing the product's reviews.
 */
export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const productId = await context.params.id;

  try {
    // Validate productId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID format.' }, { status: 400 });
    }

    const reviews: IReview[] = await Review.find({ productId: new mongoose.Types.ObjectId(productId) }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to submit a new review for a product.
 * Requires user authentication. Updates the product's average rating and review count.
 * @param {Request} req - The incoming request object with review data.
 * @param {object} context - Contains dynamic route parameters (params.id).
 * @returns {NextResponse} A JSON response with the created review.
 */
export async function POST(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const productId = context.params.id;
  const { userId } = await auth(); // Get authenticated user's ID from Clerk server auth

  // Validate user authentication
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Authentication required to submit a review.' }, { status: 401 });
  }

  try {
    // FIX: Call clerkClient() to get the client instance before accessing .users
    const clerkUser = (await clerkClient()).users.getUser(userId)

    if (!clerkUser) {
      console.error(`Clerk User with ID ${userId} not found for review submission.`);
      return NextResponse.json({ success: false, message: 'Review submission failed: User not found.' }, { status: 401 });
    }

    // Validate productId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid product ID format.' }, { status: 400 });
    }

    const body = await req.json();
    const { rating, comment } = body;

    // Basic input validation for rating and comment
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !comment || comment.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid rating or comment provided.' }, { status: 400 });
    }

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      productId: new mongoose.Types.ObjectId(productId),
      userId: userId,
    });

    if (existingReview) {
      return NextResponse.json({ success: false, message: 'You have already reviewed this product.' }, { status: 409 }); // 409 Conflict
    }

    // Use data from clerkUser for userName and userImageUrl
    const userName = (await clerkUser).fullName || (await clerkUser).username || (await clerkUser).emailAddresses?.[0]?.emailAddress || 'Anonymous';
    const userImageUrl = (await clerkUser).imageUrl || 'https://placehold.it/40x40.png?text=User'; // Consistent placeholder

    // Create the new review document
    const newReview: IReview = await Review.create({
      productId: new mongoose.Types.ObjectId(productId),
      userId: userId,
      userName: userName,
      userImageUrl: userImageUrl,
      rating: rating,
      comment: comment,
    });

    console.log(`Review for product ${productId} by user ${userId} created.`);

    // --- Recalculate Product's Average Rating and Review Count ---
    const aggregationResult = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    let updatedAverageRating = 0;
    let updatedReviewCount = 0;

    if (aggregationResult.length > 0) {
      updatedAverageRating = aggregationResult[0].averageRating;
      updatedReviewCount = aggregationResult[0].reviewCount;
    }

    // Update the Product document with new average rating and review count
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: parseFloat(updatedAverageRating.toFixed(2)), // Store with 2 decimal places
        reviewCount: updatedReviewCount,
      },
      { new: true, runValidators: true }
    );

    console.log(`Product ${productId} updated with new averageRating: ${updatedProduct?.averageRating} and reviewCount: ${updatedProduct?.reviewCount}`);

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: unknown) {
    console.error(`Error submitting review for product ${productId}:`, error);
    if (error instanceof mongoose.Error.ValidationError) {
      console.error('Mongoose Validation Errors:', JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json(
      { success: false, message: `Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
