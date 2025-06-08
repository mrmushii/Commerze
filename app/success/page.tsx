// app/success/page.tsx
'use client'; // Can be client or server, depending on if you fetch session details

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IOrder } from '@/lib/type'; // Import IOrder type
import mongoose from 'mongoose';

/**
 * Success Page after a successful Stripe Checkout.
 * Displays a success message and order details (if available).
 */
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id'); // Get Stripe sessionId from query params
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      toast.success('Payment successful! Thank you for your purchase.');
      // Fetch order details from your backend using the sessionId
      const fetchOrderDetails = async () => {
        try {
          // Assuming you have an API route to fetch order by Stripe sessionId
          // This might be part of your existing /api/orders/[id] route
          // Or a new route like /api/orders/by-stripe-session/[sessionId]
          // For simplicity, let's assume /api/orders/[id] can handle searching by stripeSessionId if `id` doesn't match ObjectId
          const res = await axios.get(`/api/orders/${sessionId}`); // Adjust this endpoint if needed
          if (res.data.success && res.data.data) {
            setOrder(res.data.data);
          } else {
            toast.error('Could not find order details.');
          }
        } catch (error: unknown) { // Changed 'any' to 'unknown'
          console.error('Failed to fetch order details:', error);
          if (axios.isAxiosError(error) && error.response?.data?.message) {
            toast.error(error.response.data.message, { id: 'fetchOrderDetails' });
          } else if (error instanceof Error) {
            toast.error(error.message || 'Error loading order details.', { id: 'fetchOrderDetails' });
          } else {
            toast.error('Error loading order details.', { id: 'fetchOrderDetails' });
          }
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
      // Optionally clear the cart from localStorage here, as payment is complete
      localStorage.removeItem('cart');
    } else {
      toast.error('Payment success page accessed without a session ID.');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-700">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center bg-white shadow-md rounded-lg max-w-lg mt-10">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful! 🎉</h1>
      <p className="text-lg text-gray-700 mb-6">Your order has been placed successfully.</p>
      {order ? (
        <div className="mb-4 text-left p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-md text-gray-700 mb-2">
            **Order ID:** <span className="font-semibold text-blue-600">{(order._id as mongoose.Types.ObjectId).toString().substring(0, 8)}...</span>
          </p>
          <p className="text-md text-gray-700 mb-2">
            **Stripe Session ID:** <span className="font-semibold text-blue-600">{sessionId}</span>
          </p>
          <p className="text-md text-gray-700">
            **Total Amount:** <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span>
          </p>
        </div>
      ) : (
        <p className="text-md text-gray-600 mb-4">Order details could not be loaded.</p>
      )}
      <div className="space-y-4">
        <Link href="/dashboard/orders" className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
          View Your Orders
        </Link>
        <Link href="/products" className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

