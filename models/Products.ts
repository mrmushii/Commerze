import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '@/lib/type'; // Import the interface from your types file

// Define the Mongoose Schema for a Product
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // Product name (e.g., "Laptop Pro")
    description: { type: String, required: true }, // Detailed description of the product
    price: { type: Number, required: true, min: 0 }, // Price of the product, must be non-negative
    imageUrl: { type: String, required: true }, // URL to the product's image
    category: { type: String, required: true, trim: true }, // Category of the product (e.g., "Electronics", "Apparel")
    stock: { type: Number, required: true, default: 0, min: 0 }, // Current stock quantity, defaults to 0, must be non-negative
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the Mongoose model.
// If the model already exists, use it; otherwise, create a new one.
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
