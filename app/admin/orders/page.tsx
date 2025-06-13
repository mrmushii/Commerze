import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder, CustomSessionClaims } from '@/lib/type';
import Link from 'next/link';
import OrderStatusDropdown from '@/components/admin/OrderStatusDropdown';
import mongoose from 'mongoose';

export default async function AdminOrdersPage() {
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.public_metadata?.role !== 'admin') {
    redirect('/sign-in');
  }

  await dbConnect();
  const orders: IOrder[] = await Order.find({}).sort({ createdAt: -1 });

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-gray-800">All Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-base sm:text-xl mt-8">No orders have been placed yet.</p>
      ) : (
        <>
          <div className="hidden sm:block">
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
                  <tr key={(order._id as mongoose.Types.ObjectId).toString()} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="py-3 px-4 border-b text-gray-800 font-medium text-sm">{(order._id as mongoose.Types.ObjectId).toString()}</td>
                    <td className="py-3 px-4 border-b text-gray-600 text-sm">{order.userId}</td>
                    <td className="py-3 px-4 border-b text-gray-800 text-sm">${order.totalAmount.toFixed(2)}</td>
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
                      <OrderStatusDropdown
                        orderId={(order._id as mongoose.Types.ObjectId).toString()}
                        currentStatus={order.orderStatus}
                      />
                    </td>
                    <td className="py-3 px-4 border-b text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <Link href={`/admin/orders/${(order._id as mongoose.Types.ObjectId).toString()}`} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div key={(order._id as mongoose.Types.ObjectId).toString()} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Order ID:</span>
                  <span className="text-gray-800 text-sm">{(order._id as mongoose.Types.ObjectId).toString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Customer ID:</span>
                  <span className="text-gray-600 text-sm">{order.userId}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Total:</span>
                  <span className="text-gray-800 text-sm">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Payment Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Order Status:</span>
                  <OrderStatusDropdown
                    orderId={(order._id as mongoose.Types.ObjectId).toString()}
                    currentStatus={order.orderStatus}
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm">Date:</span>
                  <span className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4 text-right">
                  <Link href={`/admin/orders/${(order._id as mongoose.Types.ObjectId).toString()}`} className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}