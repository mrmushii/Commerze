'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react'; // Import ShoppingCart icon
import { CartItem } from '@/lib/type'; // Ensure CartItem type is accessible
import { dispatchCartUpdateEvent } from '@/lib/cartEvents'; // Import custom event dispatcher

/**
 * A client-side component displaying a cart icon with a dynamic item count badge.
 * Styled to match the provided image's icon-only aesthetic.
 */
const CartIconWithCount: React.FC = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Function to update cart item count from localStorage
  const updateCartItemCount = () => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      // Calculate total *unique* items, not total quantity, for the count badge
      // If you prefer total quantity: cart.reduce((total, item) => total + item.quantity, 0)
      setCartItemCount(cart.length); 
    }
  };

  // Listen for custom 'cartUpdated' event
  useEffect(() => {
    updateCartItemCount(); // Initial count on mount

    // Listen for custom event dispatched from other components (AddToCartButton, CartPage)
    window.addEventListener('cartUpdated', updateCartItemCount);

    // Clean up event listener
    return () => {
      window.removeEventListener('cartUpdated', updateCartItemCount);
    };
  }, []);

  return (
    <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
      <ShoppingCart className="w-6 h-6 text-gray-800" /> {/* Larger icon */}
      {cartItemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
          {cartItemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIconWithCount;