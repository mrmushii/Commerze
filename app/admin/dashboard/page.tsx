// app/admin/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Order from '@/models/Order';
import { CustomSessionClaims } from '@/lib/type';
import Link from 'next/link';
import { Suspense } from 'react';
import SalesChart from '@/components/admin/SalesChart'; // Corrected import path for SalesChart
import { format } from 'date-fns';
import Image from 'next/image';
import mongoose from 'mongoose';

/**
 * Admin Dashboard Page (Server Component).
 * This page fetches data server-side and enforces admin-only access.
 * It also fetches aggregated data for charts and recent activities.
 */
export default async function AdminDashboardPage() {
  console.log('--- AdminDashboardPage (Server): Render Start ---');

  const { userId, sessionClaims } = await auth();

  console.log('Server: Raw userId:', userId);
  console.log('Server: Raw sessionClaims (full object):', JSON.stringify(sessionClaims, null, 2));

  const claims = sessionClaims as CustomSessionClaims;

  const isAdmin = claims?.public_metadata?.role === 'admin'; // Corrected to claims?.metadata?.role
  console.log('Server: claims?.metadata?.role:', claims?.metadata?.role);
  console.log('Server: isAdmin calculated:', isAdmin);

  if (!userId || !isAdmin) {
    console.log('Server: Unauthorized access or not admin, redirecting to /sign-in');
    redirect('/sign-in');
  }

  await dbConnect();
  console.log('Server: Database Connected.');

  try {
    const productCount = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const totalRevenuePipeline = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenuePipeline.length > 0 ? totalRevenuePipeline[0].total : 0;

    // Aggregate sales data for the chart (e.g., daily sales for the last 30 days)
    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }, // Last 30 days
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $project: { _id: 0, date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } }, totalSales: 1, count: 1 } }
    ]);

    // Format sales data for the chart
    const formattedSalesData = salesData.map(data => ({
      date: format(data.date, 'MMM dd'), // e.g., "Jun 15"
      sales: parseFloat(data.totalSales.toFixed(2)), // Ensure number
      orders: data.count, // Ensure number
    }));

    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).lean();
    const recentProducts = await Product.find({}).sort({ createdAt: -1 }).limit(5).lean();


    console.log('Server: Product Count:', productCount);
    console.log('Server: Total Orders:', totalOrders);
    console.log('Server: Total Revenue (Paid Orders):', totalRevenue.toFixed(2));
    console.log('Server: Sales Data for Chart:', JSON.stringify(formattedSalesData));
    console.log('--- AdminDashboardPage (Server): Render End ---');

    return (
      <div className="container mx-auto p-4 pt-2">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Admin Dashboard</h1>

        {/* Key Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-50 p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m7-7h.01M7 16h.01"></path></svg>
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-blue-800">{productCount}</p>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-green-800">{totalOrders}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9m0 3v2m0 3.5V21M3 6h18m-6 0a2 2 0 012-2h2a2 2 0 012 2v3m-6 0a2 2 0 00-2 2v3m-6-3a2 2 0 012-2h2a2 2 0 012 2v3m-6 0a2 2 0 00-2 2v3"></path></svg>
            <div>
              <p className="text-gray-600 text-sm">Total Revenue (Paid)</p>
              <p className="text-3xl font-bold text-purple-800">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Sales Chart Section */}
        <section className="mb-10 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Sales Overview (Last 30 Days)</h2>
          {/* Wrap SalesChart in Suspense because it's a Client Component */}
          <Suspense fallback={
            <div className="text-center p-8">
              <p className="text-gray-600">Loading sales chart...</p>
            </div>
          }>
            <SalesChart salesData={JSON.parse(JSON.stringify(formattedSalesData))} />
          </Suspense>
        </section>

        {/* Recent Activity Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-600">No recent orders.</p>
            ) : (
              <ul className="space-y-4">
                {recentOrders.map(order => (
                  <li key={(order._id as mongoose.Types.ObjectId).toString()} className="flex justify-between items-center text-gray-700">
                    <div>
                      <p className="font-medium">Order {(order._id as mongoose.Types.ObjectId).toString().substring(0, 8)}...</p>
                      <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      ${order.totalAmount.toFixed(2)} ({order.paymentStatus})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Recently Added Products</h2>
            {recentProducts.length === 0 ? (
              <p className="text-gray-600">No recently added products.</p>
            ) : (
              <ul className="space-y-4">
                {recentProducts.map(product => (
                  <li key={(product._id as mongoose.Types.ObjectId).toString()} className="flex items-center space-x-4 text-gray-700">
                    <Image
                      src={product.imageUrls?.[0]}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <ul className="flex justify-center space-x-6 text-blue-600">
            <li>
              <Link href="/admin/products" className="flex flex-col items-center hover:text-blue-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.202 5 7.5 5A6.5 6.5 0 003 11.5c0 1.657.382 3.243 1.077 4.654L9.5 21l-2.003-3.655M16.5 5c1.708 0 3.23.477 4.498 1.253m-4.498 0l-3.327 6.227m-5.485 2.115L15 21l2.003-3.655M18.5 11.5a6.5 6.5 0 10-13 0 6.5 6.5 0 0013 0z"></path></svg>
                <span className="mt-1 text-sm">Manage Products</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="flex flex-col items-center hover:text-blue-800 transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.769.742 1.769H19a2 2 0 002-2v-3a2 2 0 00-2-2H8.286c-.967 0-1.749-.117-2.286.333V6.75M9 16.5V18a2 2 0 002 2h4a2 2 0 002-2v-1.5M10 21h4"></path></svg>
                <span className="mt-1 text-sm">Manage Orders</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  } catch (error: unknown) {
    console.error('AdminDashboardPage: Failed to fetch dashboard data:', error);
    // Render an error message if data fetching fails
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
        <p className="text-lg text-gray-700">Could not retrieve dashboard data. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
