// types.ts or lib/types.ts
import mongoose, { Document } from 'mongoose';

/**
 * Interface for a Product document in MongoDB.
 * Extends Mongoose's Document for database interaction.
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for an item within an Order.
 */
export interface IOrderItem {
  productId: mongoose.Types.ObjectId; // Reference to Product ID
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

/**
 * Interface for an Order document in MongoDB.
 * Extends Mongoose's Document for database interaction.
 */
export interface IOrder extends Document {
  userId: string; // Clerk's userId
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripeSessionId?: string; // Stripe Checkout Session ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type for a single item in the shopping cart before checkout.
 */
export interface CartItem {
  productId: string; // Product ID as a string for frontend use
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}