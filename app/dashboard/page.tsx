import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order'; // Assuming you have this model
import { IOrder } from '@/lib/type'; // Assuming you have this type
import Link from 'next/link';
import mongoose from 'mongoose'; // Import mongoose for type safety
import Image from 'next/image'; // Import Next.js Image component

/**
 * User Dashboard Page.
 * This is a Server Component that serves as the root for a user's dashboard.
 * It fetches some recent orders and provides links.
 */
export default async function UserDashboardPage() {
  const { userId } = await auth(); // Await auth()

  if (!userId) {
    redirect('/sign-in'); // Redirect if not signed in
  }

  await dbConnect();
  // Example: Fetch some recent orders for the user dashboard
  const recentOrders: IOrder[] = await Order.find({ userId: userId }).sort({ createdAt: -1 }).limit(5);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Dashboard</h1>
      <p className="text-lg text-gray-700 mb-4">Welcome to your personal dashboard!</p>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-gray-600">You haven&apos;t placed any orders yet. <Link href="/products" className="text-blue-600 hover:underline">Start shopping!</Link></p>
      ) : (
        <div className="space-y-4">
          {recentOrders.map(order => (
            <div key={(order._id as mongoose.Types.ObjectId).toString()} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
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
              <p className="text-gray-600">Total: <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span></p>
              <p className="text-gray-600 text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 text-right">
                <Link href={`/dashboard/orders/${(order._id as mongoose.Types.ObjectId).toString()}`} className="text-blue-600 hover:underline font-medium">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Links</h2>
        <ul className="list-disc list-inside text-blue-600 space-y-2">
          <li><Link href="/dashboard/orders" className="hover:underline">View All Your Orders</Link></li>
          <li><Link href="/user-profile" className="hover:underline">Manage Profile (Clerk UserProfile)</Link></li>
        </ul>
      </div>
    </div>
  );
}