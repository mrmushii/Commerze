import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Link from 'next/link';
// import Order from '@/models/Order'; // Assuming you'll create this later

/**
 * Admin Dashboard Page (Server Component).
 * This page fetches data server-side and enforces admin-only access.
 */
export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = auth();

  // Redirect if not signed in or not an admin
  if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    redirect('/sign-in'); // Redirect to sign-in page if unauthorized
  }

  await dbConnect(); // Connect to your database

  // Fetch some admin-specific data, e.g., product count, total orders
  const productCount = await Product.countDocuments({});
  // const totalOrders = await Order.countDocuments({}); // Uncomment when Order model is ready

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <p className="text-lg text-gray-700 mb-4">Welcome back, Admin!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800">Products</h2>
          <p className="text-3xl font-bold text-blue-900">{productCount}</p>
        </div>
        {/*
        <div className="bg-green-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-green-800">Total Orders</h2>
          <p className="text-3xl font-bold text-green-900">{totalOrders}</p>
        </div>
        */}
        {/* Add more admin insights here */}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <ul className="list-disc list-inside text-blue-600">
          <li><Link href="/admin/products" className="hover:underline">Manage Products</Link></li>
          <li><Link href="/admin/orders" className="hover:underline">Manage Orders</Link></li>
          {/* Add more links for admin functionalities */}
        </ul>
      </div>
    </div>
  );
}
