'use client'; // Client component to fetch data and handle loading/error states

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IProduct } from '@/lib/type'; // Import IProduct type

interface NewArrivalsProps {
  title?: string; // Custom title for the section
  limit?: number; // Number of products to fetch (default is handled by API)
}

/**
 * A client-side component to display new arrival products.
 * Fetches products from `/api/products/new-arrivals`.
 */
const NewArrivals: React.FC<NewArrivalsProps> = ({ title = 'New Arrivals', limit }) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = limit ? `?limit=${limit}` : '';
        const response = await fetch(`/api/products/new-arrivals${query}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || 'Failed to fetch new arrivals.');
          toast.error(data.message || 'Error loading new arrivals.');
        }
      } catch (err: unknown) {
        console.error('Error fetching new arrivals:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast.error(`Failed to load new arrivals: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [limit]); // Re-fetch if limit prop changes

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading new arrivals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        <p>No new products available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="mx-0 md:mx-10 my-8 p-6 py-16 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 uppercase">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-0 md:px-10">
        {products.map((product) => (
          <div key={product._id.toString()} className="hover:bg-gray-50 hover:rounded-4xl overflow-hidden transform transition duration-300 hover:scale-105">
            <Link href={`/products/${product._id.toString()}`}>
              <div className="relative w-full h-48">
                <Image
                  src={product.imageUrls?.[0]}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-4xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/F0F0F0/ADADAD?text=Image+Not+Found`; }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.category} - {product.type}</p>
                <p className="text-xl font-bold mt-2">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
