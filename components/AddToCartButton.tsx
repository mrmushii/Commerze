'use client'; // This directive marks the component as a Client Component

import { useState } from 'react';
import toast from 'react-hot-toast';
import { IProduct, CartItem } from '@/lib/type'; // Import types
import mongoose from 'mongoose';

/**
 * Props for AddToCartButton.
 * Product data must be a plain object, hence `Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'> & { _id: string }`
 * to ensure _id is a string when passed from server component.
 */
interface AddToCartButtonProps {
  product: Omit<IProduct, 'createdAt' | 'updatedAt'>; // Omit Dates and use plain _id as string
}

/**
 * A client-side component for adding products to the shopping cart.
 * It manages local state for quantity and interacts with browser storage.
 */
const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1); // State for quantity selector

  // Check if the product is out of stock
  const isOutOfStock = product.stock <= 0;

  /**
   * Handles adding the product to the cart.
   * Stores cart items in localStorage.
   */
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock.');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be at least 1.');
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Cannot add more than ${product.stock} units.`);
      setQuantity(product.stock); // Adjust quantity to max available
      return;
    }

    // Retrieve current cart from localStorage
    const storedCart = localStorage.getItem('cart');
    let cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    // Find if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.productId === (product._id as mongoose.Types.ObjectId).toString());

    if (existingItemIndex > -1) {
      // If item exists, update its quantity
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error(`You already have ${cart[existingItemIndex].quantity} of this item. Cannot add ${quantity} more as it exceeds stock.`);
        return;
      }
      cart[existingItemIndex].quantity = newQuantity;
      toast.success(`Updated quantity for ${product.name} in cart!`);
    } else {
      // If item doesn't exist, add it to cart
      const cartItem: CartItem = {
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity,
      };
      cart.push(cartItem);
      toast.success(`${product.name} added to cart!`);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Ensure quantity is at least 1
        className="w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        disabled={isOutOfStock} // Disable input if out of stock
      />
      <button
        onClick={handleAddToCart}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-300 ease-in-out ${
          isOutOfStock
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
        }`}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default AddToCartButton;
