// types.ts (or lib/types.ts)
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
  // REMOVED: imageUrl: string;
  imageUrls: string[]; // NEW: Array of image URLs for multiple images
  category: string; // e.g., 'Men', 'Women', 'Kids' (Primary Category)
  type: 'Formal' | 'Casual' | 'Party' | 'Sportswear' | 'Other'; // Secondary Category: Type of clothing
  sizes: string[]; // e.g., ['S', 'M', 'L', 'XL']
  colors: string[]; // e.g., ['Red', 'Blue', 'Black']
  material: string; // e.g., 'Cotton', 'Polyester', 'Denim'
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex'; // More specific gender category
  stock: number;
  discount:number;
  // NEW: Fields for reviews summary
  averageRating: number; // Calculated average rating based on all reviews
  reviewCount: number;   // Total number of reviews
  createdAt: Date;
  updatedAt: Date;
}

/**
 * NEW: Interface for a plain data representation of a Product.
 * This is IProduct without the Mongoose Document methods,
 * and with Date objects stringified (as they are by JSON.parse/stringify).
 */
export interface IProductData extends Omit<IProduct, keyof Document | 'createdAt' | 'updatedAt'> {
  _id: string; // Ensure _id is a string when it's a plain object
  createdAt: string; // Dates are stringified by JSON.parse/stringify
  updatedAt: string;
}


/**
 * Interface for an item within an Order.
 */
export interface IOrderItem {
  productId: mongoose.Types.ObjectId; // Reference to Product ID
  name: string;
  imageUrl: string; // Keep imageUrl for order items as a snapshot
  price: number;
  quantity: number;
  discount:number
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
  imageUrl: string; // Keep imageUrl for cart items
  quantity: number;
  discount:number
}

/**
 * NEW: Interface for a Review document in MongoDB.
 */
export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId; // The product this review belongs to
  userId: string;                   // The Clerk userId of the reviewer
  userName: string;                 // The name of the reviewer (e.g., from Clerk user object)
  userImageUrl?: string;            // Reviewer's profile image (optional)
  rating: number;                   // 1-5 star rating
  comment: string;                  // The review text
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom type for Clerk's sessionClaims to ensure 'metadata' and 'role' are recognized.
 * This extends the default SessionClaims type from Clerk to include our custom publicMetadata.
 */


export interface CustomSessionClaims {
  public_metadata?: {
    role?: string;
    [key: string]: any; // Optional: for flexibility
  };
  [key: string]: any; // Optional: if there are other fields
}

