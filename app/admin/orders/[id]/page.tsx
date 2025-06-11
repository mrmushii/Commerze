import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder, CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims
import mongoose from 'mongoose'; // Import mongoose for isValidObjectId
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link';

interface OrderDetailPageProps {
  params: { id: string };
}

/**
 * Admin Single Order Detail Page.
 * This is a Server Component that fetches a specific order for admin viewing.
 */
export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { userId, sessionClaims } = await auth(); // Await auth()
  const { id } = params;

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.public_metadata?.role !== 'admin') { // Admin-only access
    redirect('/sign-in'); // Redirect if not signed in or not admin
  }
  if (!id) {
    notFound();
  }

  await dbConnect();

  let order: IOrder | null = null;
  // Try to find by MongoDB ObjectId first, then by stripeSessionId if not found
  if (mongoose.isValidObjectId(id)) {
    order = await Order.findById(id);
  }
  // If not found by ObjectId or if the ID is not a valid ObjectId, try finding by stripeSessionId
  if (!order) {
    order = await Order.findOne({ stripeSessionId: id });
  }

  if (!order) {
    notFound(); // Order not found
  }

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Order Details (Admin View)</h1>

      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Order ID: {(order._id as mongoose.Types.ObjectId).toString()}</h2>
          <span className={`px-4 py-2 text-md font-semibold rounded-full ${
            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            Status: {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>

        <p className="text-gray-700"><strong>User ID:</strong> {order.userId}</p> {/* Display full user ID for admin */}
        <p className="text-gray-700"><strong>Total Amount:</strong> <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span></p>
        <p className="text-gray-700"><strong>Payment Status:</strong> <span className={`font-semibold ${
          order.paymentStatus === 'paid' ? 'text-green-600' :
          order.paymentStatus === 'failed' ? 'text-red-600' :
          'text-yellow-600'
        }`}>
          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
        </span></p>
        <p className="text-gray-700"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
        {order.stripeSessionId && (
          <p className="text-gray-700"><strong>Transaction ID:</strong> {order.stripeSessionId}</p>
        )}

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Items in this Order:</h3>
          <ul className="space-y-4">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-md shadow-sm">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                  <p className="text-gray-700">Quantity: {item.quantity}</p>
                  <p className="text-gray-700">Price per unit: ${item.price.toFixed(2)}</p>
                  <p className="text-blue-700 font-bold">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center space-x-4">
        <Link href="/admin/orders" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
          Back to All Orders
        </Link>
        {/* You could add more admin actions here, e.g., "Change Order Status" */}
      </div>
    </div>
  );
}
