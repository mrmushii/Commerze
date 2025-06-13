import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder } from '@/lib/type';
import Link from 'next/link';
import mongoose from 'mongoose';
import Image from 'next/image';
import { User } from 'lucide-react';

export default async function UserDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  await dbConnect();
  const recentOrders: IOrder[] = await Order.find({ userId: userId }).sort({ createdAt: -1 }).limit(5);

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">Your Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto">Welcome to your personal dashboard, where you can view your recent activities and manage your profile.</p>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner">
          <p className="text-gray-600 text-xl">You haven&apos;t placed any orders yet. <Link href="/products" className="text-blue-600 hover:underline font-semibold">Start shopping!</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentOrders.map(order => (
            <div key={(order._id as mongoose.Types.ObjectId).toString()} className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Order ID: {(order._id as mongoose.Types.ObjectId).toString().substring(0, 8)}...</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-1">Total: <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span></p>
              <p className="text-gray-600 text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="mt-4 text-right">
                <Link href={`/dashboard/orders/${(order._id as mongoose.Types.ObjectId).toString()}`} className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Quick Links</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-blue-600">
          <li className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <Link href="/dashboard/orders" className="flex items-center gap-2 font-medium hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              View All Your Orders
            </Link>
          </li>
          <li className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <Link href="/user-profile" className="flex items-center gap-2 font-medium hover:underline">
              <User className="w-5 h-5" />
              Manage Profile (Clerk UserProfile)
            </Link>
          </li>
          <li className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <Link href="/contact" className="flex items-center gap-2 font-medium hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Contact Support
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}