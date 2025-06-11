// models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '@/lib/type'; // Import the interface from your types file

// Define the Mongoose Schema for a Product
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // Product name (e.g., "Men's Casual Shirt")
    description: { type: String, required: true }, // Detailed description of the product
    price: { type: Number, required: true, min: 0 }, // Price of the product, must be non-negative
    imageUrls: { type: [String], required: true, default: [] }, // Array of image URLs
    category: { type: String, required: true, trim: true }, // Primary Category: e.g., 'Men', 'Women', 'Kids'
    type: { // Secondary Category: Type of clothing
      type: String,
      enum: ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'],
      required: true,
      default: 'Other',
    },
    sizes: { type: [String], required: true }, // Available sizes, e.g., ['S', 'M', 'L']
    colors: { type: [String], required: true }, // Available colors, e.g., ['Red', 'Blue']
    material: { type: String, required: true, trim: true }, // Material, e.g., 'Cotton', 'Polyester'
    gender: { // Specific gender category
      type: String,
      enum: ['Men', 'Women', 'Kids', 'Unisex'],
      required: true,
      default: 'Unisex',
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    discount:{type:Number,required:false,default:0,min:0},
    // Current stock quantity, defaults to 0, must be non-negative
    // NEW: Review summary fields
    averageRating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating, 0-5
    reviewCount: { type: Number, default: 0, min: 0 },         // Total number of reviews
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the Mongoose model.
// If the model already exists, use it; otherwise, create a new one.
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
