'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { IProduct, CartItem } from '@/lib/type';
import { dispatchCartUpdateEvent } from '@/lib/cartEvents';

interface AddToCartButtonProps {
  product: Omit<IProduct, 'createdAt' | 'updatedAt'>;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock <= 0;

  const defaultPlaceholderImage = 'https://placehold.it/80x80.png?text=No+Image';

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
      setQuantity(product.stock);
      return;
    }

    const storedCart = localStorage.getItem('cart');
    const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    const existingItemIndex = cart.findIndex(item => item.productId === product._id.toString());

    if (existingItemIndex > -1) {
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error(`You already have ${cart[existingItemIndex].quantity} of this item. Cannot add ${quantity} more as it exceeds stock.`);
        return;
      }
      cart[existingItemIndex].quantity = newQuantity;
      toast.success(`Updated quantity for ${product.name} in cart!`);
    } else {
      const cartItem: CartItem = {
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrls?.[0] || defaultPlaceholderImage,
        quantity: quantity,
        discount: product.discount,
      };
      cart.push(cartItem);
      toast.success(`${product.name} added to cart!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    dispatchCartUpdateEvent();
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-24 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        disabled={isOutOfStock}
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