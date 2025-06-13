import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="container mx-auto p-8 text-center bg-white shadow-md rounded-lg max-w-lg mt-10">
      <h1 className="text-4xl font-bold text-red-700 mb-4">Payment Canceled 😔</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your payment was not completed. You can try again or continue shopping.
      </p>
      <div className="space-y-4">
        <Link href="/cart" className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300">
          Return to Cart
        </Link>
        <Link href="/products" className="block w-full py-3 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition duration-300">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
