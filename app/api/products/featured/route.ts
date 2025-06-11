// app/api/products/featured/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Order from '@/models/Order'; // Import Order model to check most ordered products
import { IProduct } from '@/lib/type';
import mongoose from 'mongoose';

/**
 * Handles GET requests for featured products (prioritizing most ordered).
 *
 * Logic:
 * 1. Attempts to retrieve products based on `totalQuantitySold` from orders (top sellers).
 * 2. If the number of most ordered products is less than the requested limit,
 * it fills the remaining spots with random products from the catalog.
 *
 * Query Parameters:
 * - `limit`: Number of featured products to return (default: 8)
 *
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} A JSON response containing featured products or an error.
 */
export async function GET(req: Request) {
  await dbConnect(); // Ensure database connection

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8'); // Default to 8 featured products

    let featuredProducts: IProduct[] = [];

    // --- Attempt to get most ordered products (Top Sellers) ---
    try {
      // Aggregate pipeline to find most ordered products
      const mostOrderedProducts = await Order.aggregate([
        { $unwind: "$items" }, // Deconstructs the items array into separate documents
        {
          $group: {
            _id: "$items.productId", // Group by productId
            totalQuantitySold: { $sum: "$items.quantity" }, // Sum quantities sold for each product
          },
        },
        { $sort: { totalQuantitySold: -1 } }, // Sort by most sold (descending)
        { $limit: limit }, // Take top 'limit' products
        {
          $lookup: { // Join with the Product collection to get full product details
            from: "products", // The name of the Product collection in MongoDB (usually lowercase plural of model name)
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" }, // Deconstruct the productDetails array (since $lookup returns an array)
        { $replaceRoot: { newRoot: "$productDetails" } }, // Replace root with product details
        { $project: { __v: 0 } }, // Exclude the __v field
      ]);

      // Filter out any products that might be null or undefined if lookup failed
      featuredProducts = mostOrderedProducts.filter(product => product) as IProduct[];

      console.log(`Fetched ${featuredProducts.length} most ordered products for featured collection.`);

    } catch (aggError: unknown) { // Use 'unknown' for catch block error
      console.warn("Aggregation for most ordered products failed (or no orders yet), falling back to random:", aggError instanceof Error ? aggError.message : aggError);
      // This might happen if 'products' collection name is not 'products' or other aggregation issues.
      // Continue to fetch random if aggregation fails.
    }


    // --- Fallback: If not enough most ordered products, get random products ---
    if (featuredProducts.length < limit) {
      const remainingLimit = limit - featuredProducts.length;

      // Get IDs of products already in `featuredProducts` to avoid duplicates
      const existingProductIds = new Set(featuredProducts.map(p => (p._id as mongoose.Types.ObjectId).toString()));

      const randomProducts = await Product.aggregate([
        { $match: { _id: { $nin: Array.from(existingProductIds).map(id => new mongoose.Types.ObjectId(id)) } } }, // Exclude already featured products
        { $sample: { size: remainingLimit } }, // Get 'remainingLimit' random products
        { $project: { __v: 0 } }, // Exclude the __v field
      ]);

      featuredProducts = [...featuredProducts, ...(randomProducts as IProduct[])];
      console.log(`Added ${randomProducts.length} random products to fill featured collection.`);
    }

    return NextResponse.json({ success: true, data: featuredProducts }, { status: 200 });
  } catch (error: unknown) { // Use 'unknown' for catch block error
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch featured products: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
