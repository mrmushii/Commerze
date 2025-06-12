// components/FeaturedProducts.tsx
'use client'; // Client component to fetch data and handle loading/error states

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IProduct } from '@/lib/type'; // Import IProduct type

interface FeaturedProductsProps {
  title?: string; // Custom title for the section
  limit?: number; // Number of products to fetch (default is handled by API)
}

/**
 * A client-side component to display featured products.
 * Fetches products from `/api/products/featured`.
 * Can show most ordered or random products based on API logic.
 */
const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ title = 'Featured Collection', limit }) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = limit ? `?limit=${limit}` : '';
        const response = await fetch(`/api/products/featured${query}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || 'Failed to fetch featured products.');
          toast.error(data.message || 'Error loading featured products.');
        }
      } catch (err: unknown) {
        console.error('Error fetching featured products:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast.error(`Failed to load featured products: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]); // Re-fetch if limit prop changes

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading featured products...</p>
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
        <p>No featured products available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="my-16 p-6 py-16 bg-gray-50 rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 uppercase">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-0 md:px-10">
        {products.map((product) => {
          const rating = product.averageRating || 0; // Correctly defined within the map loop

          return (
            <div key={product._id.toString()} className="hover:bg-gray-50 hover:rounded-4xl overflow-hidden transform transition duration-300 hover:scale-105">
              <Link href={`/products/${product._id.toString()}`}>
                <div className="relative w-full h-48">
                  <Image
                    src={product.imageUrls?.[0] || `https://placehold.co/400x300/F0F0F0/ADADAD?text=No+Image`} // Safely access imageUrls[0]
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
                  <div className="flex items-center mt-1 mb-2"> {/* Added a div to contain stars */}
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.324 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.324-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69L9.049 2.927z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xl font-bold mt-2">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p> {/* Safely call toFixed */}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;