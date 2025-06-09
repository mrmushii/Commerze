// app/admin/products/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';
import DeleteProductButton from '@/components/admin/DeleteProductButton';
import mongoose from 'mongoose';
import ClientImage from '@/components/ClientImage'; // Import ClientImage

interface CustomSessionClaims {
  public_metadata?: {
    role?: string;
  };
}

export default async function AdminProductsPage() {
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.public_metadata?.role !== 'admin') {
    redirect('/sign-in');
  }

  await dbConnect();
  const products: IProduct[] = await Product.find({});

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <Link
          href="/admin/products/new"
          className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 ease-in-out shadow-md"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">
          No products found. Add your first product!
        </p>
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
                <tr
                  key={(product._id as mongoose.Types.ObjectId).toString()}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td className="py-3 px-4 border-b">
                    <ClientImage
                      src={product.imageUrl}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-gray-800 font-medium">{product.name}</td>
                  <td className="py-3 px-4 border-b text-gray-600">{product.category}</td>
                  <td className="py-3 px-4 border-b text-gray-800">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4 border-b text-gray-800">{product.stock}</td>
                  <td className="py-3 px-4 border-b flex items-center space-x-2">
                    <Link
                      href={`/admin/products/edit/${(product._id as mongoose.Types.ObjectId).toString()}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
                    >
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
