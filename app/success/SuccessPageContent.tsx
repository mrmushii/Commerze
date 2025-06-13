"use client"; 

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import { IOrder } from "@/lib/type";

export function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      toast.error("Payment success page accessed without a session ID.");
      setLoading(false);
      setError("Missing Stripe session ID.");
      return;
    }

    const confirmAndFetchOrder = async () => {
      setLoading(true);
      setError(null);
      toast.loading("Confirming your order...", { id: "orderConfirmation" });

      try {
        const res = await axios.post(`/api/orders/confirm-payment`, {
          sessionId,
        });

        if (res.data.success && res.data.data) {
          setOrder(res.data.data);
          toast.success("Order confirmed and details loaded!", {
            id: "orderConfirmation",
          });
          localStorage.removeItem("cart"); 
        } else {
          const message =
            res.data.message || "Failed to confirm order with backend.";
          setError(message);
          toast.error(message, { id: "orderConfirmation" });
        }
      } catch (err: unknown) {
        console.error("Error confirming order on success page:", err);
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(`Failed to confirm order: ${message}`);
        toast.error(`Failed to confirm order: ${message}`, {
          id: "orderConfirmation",
        });
      } finally {
        setLoading(false);
      }
    };

    confirmAndFetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700">
          Confirming your order. Please wait...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center bg-white shadow-md rounded-lg max-w-lg mt-10">
        <h1 className="text-4xl font-bold text-red-700 mb-4">
          Order Confirmation Failed 😔
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          There was an issue confirming your order. Please check your order
          history later.
        </p>
        <p className="text-sm text-gray-500 mb-6">Error: {error}</p>
        <div className="space-y-4">
          <Link
            href="/dashboard/orders"
            className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
          >
            View Your Orders
          </Link>
          <Link
            href="/products"
            className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 text-center bg-white shadow-md rounded-lg max-w-lg mt-10">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Payment Successful! 🎉
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Your order has been placed successfully.
      </p>
      {order ? (
        <div className="mb-4 text-left w-auto p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-md text-gray-700 mb-2">
            <strong>Order ID:</strong>{" "}
            <span className="font-semibold text-blue-600">
              {order._id.toString().substring(0, 8)}...
            </span>
          </p>
          <p className="text-md text-gray-700 mb-2">
            <strong>Stripe Session ID:</strong>{" "}
            <span className="font-semibold text-blue-600 break-words overflow-hidden">
              {sessionId}
            </span>
          </p>
          <p className="text-md text-gray-700">
            <strong>Total Amount:</strong>{" "}
            <span className="font-bold text-blue-700">
              ${order.totalAmount.toFixed(2)}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-md text-gray-600 mb-4">
          Order details could not be loaded. Please check your order history
          page for confirmation.
        </p>
      )}
      <div className="space-y-4">
        <Link
          href="/dashboard/orders"
          className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          View Your Orders
        </Link>
        <Link
          href="/products"
          className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
