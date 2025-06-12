// components/CartSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IProduct } from '@/lib/type';

interface CartItem extends IProduct {
  quantity: number;
}

interface CartSearchProps {
  cartItems?: CartItem[];
}

const CartSearch: React.FC<CartSearchProps> = ({ cartItems = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCartItems, setFilteredCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const currentItems = cartItems || [];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = currentItems.filter(item =>
        (item.name?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.category?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.description?.toLowerCase() || '').includes(lowerCaseSearchTerm)
      );
      setFilteredCartItems(results);
    } else {
      // FIX: When searchTerm is empty, explicitly set filteredCartItems to an empty array
      // to prevent showing all cart items before any search is typed.
      setFilteredCartItems([]);
    }
  }, [searchTerm, cartItems]); // Removed filteredCartItems from dependencies previously for depth error

  return (
    <div className="relative w-full max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Search Your Cart</h3>
      <input
        type="text"
        placeholder="Search items in your cart..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* FIX: Only show results if searchTerm is not empty AND there are filtered results */}
      {searchTerm && filteredCartItems && filteredCartItems.length > 0 ? (
        <ul className="space-y-3">
          {filteredCartItems.map(item => (
            <li key={item._id?.toString() || item.name} className="flex items-center p-2 border-b last:border-b-0">
              <Image
                src={item.imageUrl || `https://placehold.co/50x50/F0F0F0/ADADAD?text=Img`}
                alt={item.name}
                width={50}
                height={50}
                className="rounded-md object-cover mr-3"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/50x50/F0F0F0/ADADAD?text=Img`; }}
              />
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">Price: ${typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : item.price}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : searchTerm && !filteredCartItems.length ? ( // Show "No matching items" only if search term exists but no results
        <p className="text-center text-gray-500">No matching items found in your cart.</p>
      ) : null} {/* Render nothing if search term is empty */}
    </div>
  );
};

export default CartSearch;