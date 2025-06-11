// app/products/search/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchComponent from '@/components/SearchComponent';
import { IProduct } from '@/lib/type';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Dedicated search results page.
 * Uses the SearchComponent with `isSearchResultsPage` prop set to true,
 * and displays the fetched results.
 */
export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to perform search when URL search params change
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryString = searchParams.toString();
        if (!queryString) { // If no search parameters, clear results
          setSearchResults([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/products/search?${queryString}`);
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data);
        } else {
          setSearchResults([]);
          setError(data.message || 'Failed to fetch search results.');
        }
      } catch (err: unknown) {
        console.error('Error fetching search results:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // Re-fetch when searchParams change in the URL

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Search Results</h1>

      {/* The SearchComponent here will handle input and filters, and update the URL */}
      <Suspense fallback={
          <div className="text-center p-8">
            <p className="text-gray-600">Loading search options...</p>
          </div>
        }>
          <SearchComponent /> {/* Integrated Search Component */}
        </Suspense>

      <section className="my-8">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search results...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-600">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((product) => (
              <div key={product._id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                <Link href={`/products/${product._id.toString()}`}>
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/F0F0F0/ADADAD?text=Image+Not+Found`; }}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate mb-1">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 text-sm">{product.category} - {product.type}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-600">
            <p>No products found matching your search criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
          </div>
        )}
      </section>
    </div>
  );
}
