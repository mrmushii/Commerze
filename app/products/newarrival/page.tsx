"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { IProduct } from "@/lib/type";
import SearchComponent from "@/components/SearchComponent";
import FeaturedProducts from "@/components/FeaturedProducts";
import NewArrivals from "@/components/NewArrivals";

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["Men", "Women", "Kids"];
  const types = ["Formal", "Casual", "Party", "Sportswear", "Other"];
  const colors = [
    "Red",
    "Blue",
    "Black",
    "White",
    "Green",
    "Yellow",
    "Gray",
    "Brown",
    "Purple",
    "Pink",
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const genders = ["Men", "Women", "Kids", "Unisex"];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("q", searchTerm);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedType) params.append("type", selectedType);

        params.append("minPrice", priceRange[0].toString());
        params.append("maxPrice", priceRange[1].toString());

        if (selectedColor) params.append("color", selectedColor);
        if (selectedSize) params.append("size", selectedSize);
        if (selectedGender) params.append("gender", selectedGender);

        const queryString = params.toString();
        console.log("Fetching products with query:", queryString);
        const response = await fetch(`/api/products/search?${queryString}`);
        const data = await response.json();

        if (response.ok && data.success) {
          console.log(
            "Fetched products successfully:",
            data.data.length,
            "items"
          );
          setProducts(data.data);
        } else {
          console.error("Failed to fetch products from API:", data.message);
          setError(data.message || "Failed to fetch products.");
        }
      } catch (err: unknown) {
        console.error("Error fetching products (network/unexpected):", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    selectedCategory,
    selectedType,
    priceRange,
    selectedColor,
    selectedSize,
    selectedGender,
  ]);


  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">

      <main className="w-full ">
        <NewArrivals />
        <FeaturedProducts title="Top Sellers You Might Love" limit={4} />
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-8 bg-linear-to-t to-2nd via-fuchsia-500  from-1st text-transparent bg-clip-text uppercase">
          Our Collections
        </h1>

        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-600">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-8 text-gray-600">
            <p>No products found matching your criteria.</p>
            <p className="text-sm mt-2">
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-9">
            {products.map((product) => (
              <div
                key={product._id.toString()}
                className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105"
              >
                <Link href={`/products/${product._id.toString()}`}>
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={
                        product.imageUrls?.[0] ||
                        `https://placehold.co/400x300/F0F0F0/ADADAD?text=No+Image`
                      }
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                      onError={(e) => {
                        (
                          e.target as HTMLImageElement
                        ).src = `https://placehold.co/400x300/F0F0F0/ADADAD?text=Image+Not+Found`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate mb-1">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 mb-2">{product.category}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.stock === 0 ? (
                      <p className="text-red-500 font-medium mt-2">
                        Out of Stock
                      </p>
                    ) : (
                      <p className="text-green-600 font-medium mt-2">
                        In Stock: {product.stock}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}