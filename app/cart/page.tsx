'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { CartItem } from '@/lib/type';
import { Trash2, Plus, Minus } from 'lucide-react';
import { dispatchCartUpdateEvent } from '@/lib/cartEvents';
import Link from 'next/link';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import CartSearch from '@/components/CartSearch';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();

  const deliveryFee = 15;

  const loadCartFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      const newCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      if (JSON.stringify(newCart) !== JSON.stringify(cartItems)) {
        setCartItems(newCart);
      }
    }
  };

  useEffect(() => {
    loadCartFromLocalStorage();

    const handleCartUpdated = () => {
      loadCartFromLocalStorage();
    };

    window.addEventListener('cartUpdated', handleCartUpdated);

    setLoading(false);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []); 

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    dispatchCartUpdateEvent();
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    dispatchCartUpdateEvent();
    toast.success('Item removed from cart.');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotalDiscountAmount = () => {
    return cartItems.reduce((totalDiscount, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const discount = typeof item.discount === 'number' ? item.discount : 0;
      return totalDiscount + (price * item.quantity * (discount / 100));
    }, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscountAmount();
    return (subtotal - totalDiscount + deliveryFee);
  };

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
          discount: item.discount
        })),
        userId: userId,
      });

      const { url } = response.data;
      if (url) {
        toast.dismiss('checkout');
        window.location.href = url;
      } else {
        toast.error('Failed to get checkout URL.', { id: 'checkout' });
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message, { id: 'checkout' });
      } else if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred during checkout.', { id: 'checkout' });
      } else {
        toast.error('An unexpected error occurred during checkout.', { id: 'checkout' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto mt-8 px-4">
        <div className="text-gray-600 text-sm mb-4">
          <Link href="/" className="hover:underline">Home</Link> &gt; Cart
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">YOUR CART</h1>

        <CartSearch cartItems={cartItems} />

        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-xl">Your cart is currently empty. Start shopping!</p>
            <Link href="/products" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3 space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-xl shadow-lg p-4 flex items-center space-x-4">
                  <Image
                    src={item.imageUrl || `https://placehold.it/120x120.png?text=No+Image`}
                    alt={item.name}
                    width={120}
                    height={120}
                    className="rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                        {typeof item.discount === 'number' && item.discount > 0 ? (
                          <p className="text-sm text-gray-500">
                            <span className="line-through mr-1">${item.price.toFixed(2)}</span>
                            <span className="text-red-500 font-medium">${(item.price * (1 - item.discount / 100)).toFixed(2)}</span>
                            <span className="ml-1 text-green-600">(-{item.discount}%)</span>
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">Price per unit</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {(typeof item.discount === 'number' && item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price).toFixed(2)}
                    </p>

                    <div className="flex items-center space-x-2 mt-3 bg-gray-100 rounded-full px-2 py-1 w-fit">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-lg text-gray-800 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 text-gray-700 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:w-1/3 bg-white rounded-xl shadow-lg p-6 space-y-4 h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Order Summary</h2>

              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
              </div>
              {calculateTotalDiscountAmount() > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span className="font-semibold text-red-600">-${calculateTotalDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${calculateFinalTotal().toFixed(2)}</span>
              </div>

              <div className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Add promo code"
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Apply
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className={`w-full mt-6 px-6 py-3 rounded-lg font-bold text-white text-lg transition duration-300 ease-in-out ${
                  loading || cartItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 active:bg-gray-900 shadow-lg'
                }`}
              >
                Go to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
      <NewsletterSubscription />
    </>
  );
}