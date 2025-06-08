import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder } from '@/lib/type';
import Link from 'next/link';
import OrderStatusDropdown from '@/components/admin/OrderStatusDropdown'; // We'll create this
import mongoose from 'mongoose'; // Import mongoose for type safety

/**
 * Admin Order Management Page.
 * This is a Server Component that fetches all orders from the database.
 */

interface CustomSessionClaims {
  metadata?: {
    role?: string; // Make role optional as it might not always be present
  };
}

export default async function AdminOrdersPage() {
  const { userId, sessionClaims } = await auth(); // Await auth()

  // Redirect if not signed in or not an admin
 const claims = sessionClaims as CustomSessionClaims;
 
   // Redirect if not signed in or not an admin
   // Check for userId, then safely access role using optional chaining
   if (!userId || claims?.metadata?.role !== 'admin') {
     redirect('/sign-in'); // Redirect to sign-in page if unauthorized
   }
 
  await dbConnect(); // Connect to MongoDB
  const orders: IOrder[] = await Order.find({}).sort({ createdAt: -1 }); // Fetch all orders, newest first

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">All Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">No orders have been placed yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Order ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Customer ID</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Payment Status</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Order Status</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                // Explicitly cast order._id to mongoose.Types.ObjectId for toString()
                <tr key={(order._id as mongoose.Types.ObjectId).toString()} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-3 px-4 border-b text-gray-800 font-medium">{(order._id as mongoose.Types.ObjectId).toString().substring(0, 8)}...</td>
                  <td className="py-3 px-4 border-b text-gray-600">{order.userId.substring(0, 8)}...</td> {/* Display partial userId */}
                  <td className="py-3 px-4 border-b text-gray-800">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {/* Client component for updating status */}
                    <OrderStatusDropdown
                      orderId={(order._id as mongoose.Types.ObjectId).toString()}
                      currentStatus={order.orderStatus}
                    />
                  </td>
                  <td className="py-3 px-4 border-b text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <Link href={`/admin/orders/${(order._id as mongoose.Types.ObjectId).toString()}`} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition">
                      Details
                    </Link>
                    {/* Add delete button for admin if needed, similar to products */}
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