// components/NewsletterSubscription.tsx
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * A client-side component for newsletter subscription.
 * Currently, it only shows a toast notification on submission.
 */
const NewsletterSubscription: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clear any previous toasts

    if (!email || !email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Simulate API call for newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    toast.success(`Successfully subscribed ${email} to our newsletter!`);
    setEmail('');
    setLoading(false);
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Stay Updated!</h2>
      <p className="text-lg text-gray-700 mb-6">
        Subscribe to our newsletter for exclusive offers, new arrivals, and fashion tips.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-300 shadow-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
          disabled={loading}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSubscription;
