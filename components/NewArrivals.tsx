"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { IProduct } from "@/lib/type";

interface NewArrivalsProps {
  title?: string;
  limit?: number;
}

const NewArrivals: React.FC<NewArrivalsProps> = ({
  title = "New Arrivals",
  limit,
}) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = limit ? `?limit=${limit}` : "";
        const response = await fetch(`/api/products/new-arrivals${query}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || "Failed to fetch new arrivals.");
          toast.error(data.message || "Error loading new arrivals.");
        }
      } catch (err: unknown) {
        console.error("Error fetching new arrivals:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast.error(`Failed to load new arrivals: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [limit]);

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
    <section className="mx-0 md:mx-10 mt-8 p-6 py-16 bg-transparent rounded-lg text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-8 bg-gradient-to-b from-purple-200 to-purple-600 bg-clip-text text-transparent uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-0 md:px-10 my-10">
        {products.map((product) => {
          const rating = product.averageRating || 0;
          const formattedRating = rating.toFixed(1);

          return (
            <div
              key={product._id.toString()}
              className="bg-white hover:bg-gray-50 rounded-4xl overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <Link href={`/products/${product._id.toString()}`}>
                <div className="relative w-full h-64">
                  <Image
                    src={product.imageUrls?.[0]}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x300/F0F0F0/ADADAD?text=Image+Not+Found";
                    }}
                  />
                </div>
                <div className="p-4 text-start">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center mt-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.324 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.324-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69L9.049 2.927z"></path>
                      </svg>
                    ))}
                    <span className="ml-1 text-gray-500 text-xs">{formattedRating}/5</span>
                  </div>
                  <p className="text-xl font-bold mt-2 text-gray-800">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NewArrivals;