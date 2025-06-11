// models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '@/lib/type'; // Import the interface from your types file

const ReviewSchema: Schema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
      required: true,
      index: true, // Index for faster lookup of reviews by product
    },
    userId: {
      type: String, // Clerk's userId
      required: true,
    },
    userName: {
      type: String, // Reviewer's name (e.g., "John Doe")
      required: true,
    },
    userImageUrl: {
      type: String, // Reviewer's profile image URL (optional)
      default: 'https://placehold.it/50x50.png?text=User', // Default placeholder for user image
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating is 1 star
      max: 5, // Maximum rating is 5 stars
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // Limit comment length
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Ensure a user can only review a product once (optional, but good for data integrity)
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Export the Mongoose model.
export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
