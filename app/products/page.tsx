export const dynamic = 'force-dynamic'; // Avoids build-time MongoDB connection errors

import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';
import mongoose from 'mongoose';
import CustomImage from '@/components/CustomImage'; // Client component

export default async function ProductsPage() {
  let products: IProduct[] = [];

  try {
    await dbConnect();
    products = await Product.find({});
  } catch (error) {
    console.error('❌ Failed to load products:', error);
    // Optionally display an error toast or message on UI if needed
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Products</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No products available yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={(product._id as mongoose.Types.ObjectId).toString()}
              className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <Link href={`/products/${(product._id as mongoose.Types.ObjectId).toString()}`}>
                <div className="relative w-full h-48 bg-gray-200">
                  <CustomImage
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 truncate mb-1">{product.name}</h2>
                  <p className="text-gray-600 mb-2">{product.category}</p>
                  <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                  {product.stock === 0 ? (
                    <p className="text-red-500 font-medium mt-2">Out of Stock</p>
                  ) : (
                    <p className="text-green-600 font-medium mt-2">In Stock: {product.stock}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
