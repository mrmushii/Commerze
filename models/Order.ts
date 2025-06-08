// models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, IOrderItem } from '@/lib/type'; // Import interfaces from your types file

// Define the Mongoose Schema for an item within an order
const OrderItemSchema: Schema<IOrderItem> = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the Product ID
    name: { type: String, required: true }, // Name of the product at the time of order
    imageUrl: { type: String, required: true }, // Image URL of the product at the time of order
    price: { type: Number, required: true, min: 0 }, // Price of the product at the time of order
    quantity: { type: Number, required: true, min: 1 }, // Quantity ordered, must be at least 1
  },
  { _id: false } // Do not create a default _id for subdocuments
);

// Define the Mongoose Schema for an Order
const OrderSchema: Schema<IOrder> = new Schema(
  {
    userId: { type: String, required: true, index: true }, // Clerk's userId, indexed for faster lookup
    items: { type: [OrderItemSchema], required: true }, // Array of products in the order
    totalAmount: { type: Number, required: true, min: 0 }, // Total cost of the order
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'], // Status of the payment
      default: 'pending',
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // Status of the order fulfillment
      default: 'pending',
      required: true,
    },
    stripeSessionId: { type: String, unique: true, sparse: true }, // Optional: Stripe Checkout Session ID, unique and sparse (allows nulls)
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the Mongoose model.
// If the model already exists, use it; otherwise, create a new one.
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
