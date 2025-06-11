'use client'; // Can be client or server, depending on if you fetch session details

import { useEffect, useState, Suspense } from 'react'; // Import Suspense
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IOrder } from '@/lib/type'; // Import IOrder type

/**
 * Success Page content component.
 * Fetches order details after a successful Stripe Checkout using polling.
 */
function SuccessPageContent() { // Renamed to SuccessPageContent
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id'); // Get Stripe sessionId from query params
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0); // Track retry attempts
  const maxAttempts = 5; // Max retries
  const retryDelay = 1000; // 1 second delay between retries

  useEffect(() => {
    if (!sessionId) {
      toast.error('Payment success page accessed without a session ID.');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      toast.loading('Confirming your order...', { id: 'orderConfirmation' });

      let currentAttempts = 0;
      let fetchedOrder: IOrder | null = null;

      while (currentAttempts < maxAttempts && !fetchedOrder) {
        try {
          const res = await axios.get(`/api/orders/${sessionId}`);
          if (res.data.success && res.data.data) {
            fetchedOrder = res.data.data;
            toast.success('Order confirmed and details loaded!', { id: 'orderConfirmation' });
          } else {
            // Order not found yet, or API returned success: false
            console.warn(`Attempt ${currentAttempts + 1}: Order not found or failed response.`);
          }
        } catch (error: unknown) {
          console.error(`Attempt ${currentAttempts + 1}: Failed to fetch order details:`, error);
        }

        if (!fetchedOrder && currentAttempts < maxAttempts - 1) {
          // If order not found and more attempts remaining, wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        currentAttempts++;
      }

      setOrder(fetchedOrder);
      setLoading(false);

      if (!fetchedOrder) {
        toast.error('Could not find your order details after multiple attempts. Please check your order history later.', { id: 'orderConfirmation' });
      }
    };

    fetchOrderDetails();
    // Optionally clear the cart from localStorage here, as payment is complete
    localStorage.removeItem('cart');
  }, [sessionId]); // Re-run effect if sessionId changes

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700">Confirming your order. Please wait...</p>
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
            **Order ID:** <span className="font-semibold text-blue-600">{order._id.toString().substring(0, 8)}...</span>
          </p>
          <p className="text-md text-gray-700 mb-2">
            **Stripe Session ID:** <span className="font-semibold text-blue-600">{sessionId}</span>
          </p>
          <p className="text-md text-gray-700">
            **Total Amount:** <span className="font-bold text-blue-700">${order.totalAmount.toFixed(2)}</span>
          </p>
        </div>
      ) : (
        <p className="text-md text-gray-600 mb-4">Order details could not be loaded. Please check your order history page for confirmation.</p>
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

// Export the main page component wrapped in Suspense for initial render
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-700">Loading success page...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
