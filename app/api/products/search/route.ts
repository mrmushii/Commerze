import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';

/**
 * Handles GET requests for searching products.
 * Supports searching by keyword, category, type, min/max price, color, size, and gender.
 *
 * Query Parameters:
 * - `q`: Search keyword (name, description, material)
 * - `category`: Primary category (e.g., 'Men', 'Women', 'Kids')
 * - `type`: Secondary category (e.g., 'Formal', 'Casual')
 * - `minPrice`: Minimum price
 * - `maxPrice`: Maximum price
 * - `color`: Specific color
 * - `size`: Specific size
 * - `gender`: Specific gender
 *
 * @param {Request} req - The incoming request object.
 * @returns {NextResponse} A JSON response containing matching products or an error.
 */
export async function GET(req: Request) {
  await dbConnect(); // Ensure database connection

  try {
    const { searchParams } = new URL(req.url);
    const query: { [key: string]: any } = {}; // Build query object for MongoDB

    // Search by keyword (name, description, material)
    const q = searchParams.get('q');
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } }, // Case-insensitive search on name
        { description: { $regex: q, $options: 'i' } }, // Case-insensitive search on description
        { material: { $regex: q, $options: 'i' } }, // Case-insensitive search on material
      ];
    }

    // Filter by category (e.g., Men, Women, Kids)
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }

    // Filter by clothing type (e.g., Formal, Casual)
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }

    // Filter by price range
    const minPrice = parseFloat(searchParams.get('minPrice') || '');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '');
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) {
        query.price.$gte = minPrice;
      }
      if (!isNaN(maxPrice)) {
        query.price.$lte = maxPrice;
      }
    }

    // Filter by color (e.g., Red, Blue) - checks if the color is in the 'colors' array
    const color = searchParams.get('color');
    if (color) {
      query.colors = { $in: [color] };
    }

    // Filter by size (e.g., S, M, L) - checks if the size is in the 'sizes' array
    const size = searchParams.get('size');
    if (size) {
      query.sizes = { $in: [size] };
    }

    // Filter by gender
    const gender = searchParams.get('gender');
    if (gender) {
      query.gender = gender;
    }

    // Fetch products based on the constructed query
    const products: IProduct[] = await Product.find(query);

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { success: false, message: `Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}