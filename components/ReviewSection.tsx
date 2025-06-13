'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/nextjs';
import { IReview } from '@/lib/type';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReviewSectionProps {
  productId: string;
  onNewReview?: (newReview: IReview) => void;
  onRatingUpdated?: (averageRating: number, reviewCount: number) => void;
}

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, 'Rating is required.').max(5, 'Rating must be between 1 and 5.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters.').max(500, 'Comment cannot exceed 500 characters.'),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, onNewReview, onRatingUpdated }) => {
  const { isSignedIn, userId } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorLoadingReviews, setErrorLoadingReviews] = useState<string | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, isValid } } = form;

  const currentRating = watch('rating');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setErrorLoadingReviews(null);
      try {
        const response = await axios.get(`/api/products/${productId}/reviews`);
        if (response.data.success) {
          setReviews(response.data.data);
          if (isSignedIn && userId) {
            setHasUserReviewed(response.data.data.some((review: IReview) => review.userId === userId));
          }
        } else {
          setErrorLoadingReviews(response.data.message || 'Failed to load reviews.');
        }
      } catch (err: unknown) {
        console.error('Error fetching reviews:', err);
        setErrorLoadingReviews(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [productId, isSignedIn, userId]);

  const onSubmit = async (data: ReviewFormValues) => {
    if (!isSignedIn || !user || !isUserLoaded) {
      toast.error('You must be signed in to submit a review.');
      return;
    }
    if (hasUserReviewed) {
      toast.error('You have already submitted a review for this product.');
      return;
    }

    toast.loading('Submitting review...', { id: 'submitReview' });

    try {
      const response = await axios.post(`/api/products/${productId}/reviews`, {
        rating: data.rating,
        comment: data.comment,
        userName: user.fullName || user.username || user.emailAddresses?.[0]?.emailAddress || 'Anonymous',
        userImageUrl: user.imageUrl || 'https://placehold.it/40x40.png?text=User',
      });
      if (response.data.success) {
        const newReview: IReview = response.data.data;
        setReviews(prev => [newReview, ...prev]);
        setHasUserReviewed(true);
        reset({ rating: 0, comment: '' });
        toast.success('Review submitted successfully!', { id: 'submitReview' });

        if (onNewReview) onNewReview(newReview);
        if (onRatingUpdated) {
          const productResponse = await axios.get(`/api/products/${productId}`);
          if (productResponse.data.success) {
            onRatingUpdated(productResponse.data.data.averageRating, productResponse.data.data.reviewCount);
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to submit review.', { id: 'submitReview' });
      }
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message, { id: 'submitReview' });
      } else {
        toast.error('An unexpected error occurred during review submission.', { id: 'submitReview' });
      }
    }
  };

  return (
    <section className="mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Customer Reviews ({reviews.length})</h2>

      {isSignedIn && isUserLoaded && !hasUserReviewed ? (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setValue('rating', i + 1, { shouldValidate: true })}
                    className={`w-8 h-8 text-yellow-500 transition-colors duration-200 focus:outline-none ${
                      i < currentRating ? 'fill-current' : 'fill-none'
                    }`}
                  >
                    <svg className="w-full h-full" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.203 9.091c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
                  </button>
                ))}
              </div>
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
              <textarea
                id="comment"
                rows={4}
                {...register('comment')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-300 shadow-md ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : isSignedIn && hasUserReviewed ? (
        <div className="mb-8 p-6 bg-yellow-50 text-yellow-800 rounded-lg shadow-sm text-center">
          <p className="font-semibold">You have already submitted a review for this product.</p>
          <p className="text-sm">Thank you for your feedback!</p>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 text-blue-800 rounded-lg shadow-sm text-center">
          <p className="font-semibold">Please <Link href="/sign-in" className="text-blue-600 hover:underline">sign in</Link> to write a review.</p>
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">All Reviews</h3>
      {loadingReviews ? (
        <div className="text-center p-4">Loading reviews...</div>
      ) : errorLoadingReviews ? (
        <div className="text-center p-4 text-red-600">Error loading reviews: {errorLoadingReviews}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center p-4 text-gray-600">No reviews yet. Be the first to review this product!</div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id.toString()} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
              <div className="flex items-center mb-3">
                <Image
                  src={review.userImageUrl || 'https://placehold.it/40x40.png?text=User'}
                  alt={review.userName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-semibold text-gray-800">{review.userName}</p>
                  <div className="flex items-center text-yellow-500 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.203 9.091c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
                    ))}
                    <span className="ml-1">{review.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-700 mt-3">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;