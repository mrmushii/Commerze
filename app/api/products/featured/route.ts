import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Order from '@/models/Order'; // Import Order model to check most ordered products
import { IProduct } from '@/lib/type';


/**
 * Handles GET requests for featured products.
 * Prioritizes 'most ordered' products. If not enough data, returns random products.
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

    // --- Attempt to get most ordered products ---
    try {
      const mostOrderedProductIds = await Order.aggregate([
        { $unwind: "$items" }, // Deconstructs the items array into separate documents
        {
          $group: {
            _id: "$items.productId", // Group by productId
            totalQuantitySold: { $sum: "$items.quantity" }, // Sum quantities sold for each product
          },
        },
        { $sort: { totalQuantitySold: -1 } }, // Sort by most sold
        { $limit: limit }, // Take top 'limit' products
        {
          $lookup: { // Join with the Product collection
            from: "products", // The name of the Product collection in MongoDB
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" }, // Deconstruct the productDetails array
        { $replaceRoot: { newRoot: "$productDetails" } }, // Replace root with product details
        { $project: { __v: 0 } }, // Exclude the __v field
      ]);

      // Filter out any products that might be null or undefined if lookup failed
      featuredProducts = mostOrderedProductIds.filter(product => product) as IProduct[];

      console.log(`Fetched ${featuredProducts.length} most ordered products.`);

    } catch (aggError) {
      console.warn("Aggregation for most ordered products failed, falling back to random:", aggError);
      // This might happen if 'products' collection name is not 'products' or other aggregation issues.
      // Continue to fetch random if aggregation fails.
    }


    // --- Fallback: If not enough most ordered products, get random products ---
    if (featuredProducts.length < limit) {
      const remainingLimit = limit - featuredProducts.length;
      const randomProducts = await Product.aggregate([
        { $sample: { size: remainingLimit } }, // Get 'remainingLimit' random products
        { $project: { __v: 0 } }, // Exclude the __v field
      ]);
      // Filter out any duplicates if some random products were already in featuredProducts
      const existingProductIds = new Set(featuredProducts.map(p => p._id.toString()));
      const newRandomProducts = randomProducts.filter(p => !existingProductIds.has(p._id.toString()));

      featuredProducts = [...featuredProducts, ...(newRandomProducts as IProduct[])];
      console.log(`Added ${newRandomProducts.length} random products to featured collection.`);
    }

    return NextResponse.json({ success: true, data: featuredProducts }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch featured products: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
