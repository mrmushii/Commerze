import { Document } from 'mongoose';
import mongoose from 'mongoose'; // Import mongoose here for ObjectId type

/**
 * Interface for a Product document in MongoDB.
 * Extends Mongoose's Document for database interaction.
 */
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly define _id type
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
  _id: mongoose.Types.ObjectId; // Explicitly define _id type
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

/**
 * Custom type for Clerk's sessionClaims to ensure 'metadata' and 'role' are recognized.
 * This extends the default SessionClaims type from Clerk to include our custom publicMetadata.
 */
export interface CustomSessionClaims {
  metadata?: {
    role?: string; // Make role optional as it might not always be present
  };
}
