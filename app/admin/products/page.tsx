// app/admin/products/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Keep Image for general usage if needed
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct, CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims and IProduct
import mongoose from 'mongoose'; // Import mongoose for type safety
import ImageWithFallback from '@/components/ImageWithFallback'; // Import the new client component
import DeleteProductButton from '@/components/admin/DeleteProductButton';


/**
 * Admin Product Management Page.
 * This is a Server Component, fetching all products directly from the database.
 */
export default async function AdminProductsPage() {
  const { userId, sessionClaims } = await auth(); // Await auth()

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  // Redirect if not signed in or not an admin
  if (!userId || claims?.public_metadata?.role !== 'admin') {
    redirect('/sign-in'); // Or a custom unauthorized page
  }

  await dbConnect(); // Connect to MongoDB
  const products: IProduct[] = await Product.find({}); // Fetch all products

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <Link href="/admin/products/new" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-md">
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">No products found. Add your first product!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Stock</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                // IMPORTANT: Ensure no whitespace (newlines/spaces) between <td> tags on the same line
                <tr key={(product._id as mongoose.Types.ObjectId).toString()} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-3 px-4 border-b">
                    <ImageWithFallback // Using ImageWithFallback
                      // FIX: Use product.imageUrls[0] with optional chaining and fallback
                      src={product.imageUrls?.[0] || `https://placehold.co/60x60/F0F0F0/ADADAD?text=No+Image`}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                      fallbackSrc={`https://placehold.co/60x60/F0F0F0/ADADAD?text=Img`}
                    />
                  </td><td className="py-3 px-4 border-b text-gray-800 font-medium">{product.name}</td><td className="py-3 px-4 border-b text-gray-600">{product.category}</td><td className="py-3 px-4 border-b text-gray-800">${product.price.toFixed(2)}</td><td className="py-3 px-4 border-b text-gray-800">{product.stock}</td><td className="py-3 px-4 border-b flex items-center space-x-2">
                    <Link href={`/admin/products/edit/${(product._id as mongoose.Types.ObjectId).toString()}`} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition">
                      Edit
                    </Link>
                    <DeleteProductButton productId={(product._id as mongoose.Types.ObjectId).toString()} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}