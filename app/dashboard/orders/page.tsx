import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder } from '@/lib/type';
import Link from 'next/link';

/**
 * User Order History Page.
 * This is a Server Component that fetches orders specific to the authenticated user.
 */
export default async function UserOrdersPage() {
  const { userId } = auth();

  // Redirect if user is not signed in
  if (!userId) {
    redirect('/sign-in');
  }

  await dbConnect(); // Connect to MongoDB
  // Fetch orders for the current user
  const orders: IOrder[] = await Order.find({ userId: userId }).sort({ createdAt: -1 }); // Sort by newest first

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id.toString()} className="border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">Order ID: {order._id.toString().substring(0, 8)}...</h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-2">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-600 mb-4">Total Amount: <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span></p>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-3 text-gray-700">
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                      <span>{item.name} x {item.quantity} - ${item.price.toFixed(2)} each</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-right">
                <Link href={`/dashboard/orders/${order._id.toString()}`} className="text-blue-600 hover:underline font-medium">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
