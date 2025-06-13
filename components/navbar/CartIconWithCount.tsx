'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react'; 
import { CartItem } from '@/lib/type'; 
// import { dispatchCartUpdateEvent } from '@/lib/cartEvents';

const CartIconWithCount: React.FC = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  const updateCartItemCount = () => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      setCartItemCount(cart.length); 
    }
  };

  useEffect(() => {
    updateCartItemCount();
    window.addEventListener('cartUpdated', updateCartItemCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartItemCount);
    };
  }, []);

  return (
    <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
      <ShoppingCart className="w-6 h-6 text-gray-800" />
      {cartItemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
          {cartItemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIconWithCount;