'use client'; // This is a Client Component

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs'; // Get Clerk's authentication status
import { CartItem } from '@/lib/type'; // Import CartItem type

/**
 * Shopping Cart Page.
 * Manages cart items stored in localStorage and initiates Stripe Checkout.
 */
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn, userId } = useAuth(); // Get Clerk's authentication state

  // Load cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  /**
   * Updates an item's quantity in the cart.
   * @param {string} productId - The ID of the product to update.
   * @param {number} newQuantity - The new quantity for the product.
   */
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId); // Remove item if quantity is 0 or less
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  /**
   * Removes an item from the cart.
   * @param {string} productId - The ID of the product to remove.
   */
  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart.');
  };

  /**
   * Calculates the total amount of items in the cart.
   * @returns {number} The total sum of all item prices multiplied by their quantities.
   */
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /**
   * Handles the checkout process by creating a Stripe Checkout Session.
   */
  const handleCheckout = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to proceed to checkout.');
      router.push('/sign-in');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setLoading(true);
    toast.loading('Preparing checkout...', { id: 'checkout' });

    try {
      const response = await axios.post('/api/checkout-session', {
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        userId: userId, // Pass Clerk's userId to backend
      });

      const { url } = response.data;
      if (url) {
        toast.dismiss('checkout');
        window.location.href = url; // Redirect to Stripe Checkout page
      } else {
        toast.error('Failed to get checkout URL.', { id: 'checkout' });
      }
    } catch (error: any) {
      console.error('Checkout error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to initiate checkout. Please try again.', { id: 'checkout' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">Your cart is currently empty. Start shopping!</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center border border-gray-200 rounded-md p-4 shadow-sm">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md object-cover mr-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/80x80/F0F0F0/ADADAD?text=Img`;
                  }}
                />
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                    className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-end items-center">
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800 mb-4">Total: <span className="text-blue-700">${calculateTotal().toFixed(2)}</span></p>
              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className={`px-8 py-3 rounded-lg font-bold text-white text-lg transition duration-300 ease-in-out ${
                  loading || cartItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}