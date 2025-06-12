// components/NewsletterSubscription.tsx
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react'; // Import the Mail icon

/**
 * A client-side component for newsletter subscription.
 * Currently, it only shows a toast notification on submission.
 */
const NewsletterSubscription: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss(); // Clear any previous toasts
    setLoading(true);

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
    <section className="mx-0 md:mx-10 my-8 p-6 py-12 rounded-lg shadow-md flex flex-col gap-10 md:gap-0 md:flex-row justify-around items-center bg-black text-white">
      <h2 className="w-full md:w-1/2 text-2xl md:text-4xl font-bold text-center">STAY UPTO DATE ABOUT <br /> OUR LATEST OFFERS</h2>
      <form onSubmit={handleSubmit} className="w-3/4 md:w-1/3 flex flex-col justify-center items-center gap-4 max-w-xl mx-auto">
        <div className="relative w-full"> {/* Add a wrapper for the icon and input */}
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /> {/* Mail Icon */}
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-3 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" // Adjusted padding-left
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className={`w-full px-6 py-3 rounded-lg font-semibold text-black transition duration-300 shadow-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 active:bg-blue-800 hover:scale-110'
          }`}
          disabled={loading}
        >
          {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>
      </form>
    </section>
  );
};

export default NewsletterSubscription;