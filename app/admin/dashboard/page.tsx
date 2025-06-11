import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Order from '@/models/Order'; // Import Order model for total orders
import { CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims
import Link from 'next/link';

/**
 * Admin Dashboard Page (Server Component).
 * This page fetches data server-side and enforces admin-only access.
 */
export default async function AdminDashboardPage() {
  console.log('--- AdminDashboardPage (Server): Render Start ---');

  const { userId, sessionClaims } = await auth(); // Await auth()

  // Log the raw userId and the full sessionClaims object from the server
  console.log('Server: Raw userId:', userId);
  console.log('Server: Raw sessionClaims (full object):', JSON.stringify(sessionClaims, null, 2));

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  const isAdmin = claims?.public_metadata?.role === 'admin';
  console.log('Server: claims?.metadata?.role:', claims?.metadata?.role);
  console.log('Server: isAdmin calculated:', isAdmin);

  if (!userId || !isAdmin) {
    console.log('Server: Unauthorized access or not admin, redirecting to /sign-in');
    redirect('/sign-in');
  }

  // --- If the above check passes, proceed with database and rendering ---
  await dbConnect(); // Connect to your database
  const productCount = await Product.countDocuments({});
  const totalOrders = await Order.countDocuments({}); // Fetch total orders
  const totalRevenuePipeline = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } }, // Only count paid orders
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = totalRevenuePipeline.length > 0 ? totalRevenuePipeline[0].total : 0;


  console.log('Server: Product Count:', productCount);
  console.log('Server: Total Orders:', totalOrders);
  console.log('Server: Total Revenue (Paid Orders):', totalRevenue.toFixed(2));
  console.log('--- AdminDashboardPage (Server): Render End ---');

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <p className="text-lg text-gray-700 mb-4">Welcome back, Admin!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800">Products</h2>
          <p className="text-3xl font-bold text-blue-900">{productCount}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-green-800">Total Orders</h2>
          <p className="text-3xl font-bold text-green-900">{totalOrders}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-purple-800">Total Revenue</h2>
          <p className="text-3xl font-bold text-purple-900">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <ul className="list-disc list-inside text-blue-600 space-y-2">
          <li><Link href="/admin/products" className="hover:underline">Manage Products</Link></li>
          <li><Link href="/admin/orders" className="hover:underline">Manage Orders</Link></li>
        </ul>
      </div>
    </div>
  );
}