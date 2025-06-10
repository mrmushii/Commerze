// app/products/page.tsx
// This page now acts as a comprehensive product listing with filtering and categories.
'use client'; // Made client component to handle dynamic filtering states

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';


import { IProduct } from '@/lib/type';
import SearchComponent from '@/components/SearchComponent'; // For the combined search/filter UI
import FeaturedProducts from '@/components/FeaturedProducts'; // For the featured section
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states, manage them locally or lift up if needed
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  const categories = ['Men', 'Women', 'Kids'];
  const types = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const colors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        // Append filter parameters to the API call
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedType) params.append('type', selectedType);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (selectedColor) params.append('color', selectedColor);
        if (selectedSize) params.append('size', selectedSize);
        if (selectedGender) params.append('gender', selectedGender);

        const queryString = params.toString();
        const response = await fetch(`/api/products/search?${queryString}`); // Use the search API
        const data = await response.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          setError(data.message || 'Failed to fetch products.');
        }
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedType, minPrice, maxPrice, selectedColor, selectedSize, selectedGender]); // Re-fetch when any filter changes

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Collections</h1>

      {/* Primary Category Navigation (Men, Women, Kids) */}
      <section className="mb-8 p-4 bg-blue-50 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Shop by Main Category</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)} // Toggle selection
              className={`px-6 py-3 rounded-full font-semibold transition duration-300 ${
                selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Filtering Options */}
      <section className="mb-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Filter Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">Clothing Type</label>
            <select id="typeFilter" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">All Types</option>
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="genderFilter" className="block text-sm font-medium text-gray-700">Gender</label>
            <select id="genderFilter" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">All Genders</option>
              {genders.map(gender => <option key={gender} value={gender}>{gender}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="minPriceFilter" className="block text-sm font-medium text-gray-700">Min Price ($)</label>
            <input type="number" id="minPriceFilter" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Min" />
          </div>
          <div>
            <label htmlFor="maxPriceFilter" className="block text-sm font-medium text-gray-700">Max Price ($)</label>
            <input type="number" id="maxPriceFilter" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Max" />
          </div>
          <div>
            <label htmlFor="colorFilter" className="block text-sm font-medium text-gray-700">Color</label>
            <select id="colorFilter" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Any Color</option>
              {colors.map(color => <option key={color} value={color}>{color}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sizeFilter" className="block text-sm font-medium text-gray-700">Size</label>
            <select id="sizeFilter" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
              <option value="">Any Size</option>
              {sizes.map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => { // Clear all filters
            setSelectedCategory('');
            setSelectedType('');
            setMinPrice('');
            setMaxPrice('');
            setSelectedColor('');
            setSelectedSize('');
            setSelectedGender('');
            toast.success('Filters cleared!');
          }}
          className="mt-6 px-5 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
        >
          Clear Filters
        </button>
      </section>


      {/* Product Grid based on filters */}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
      )}

      {/* Featured Collections Section (after regular products) */}
      <FeaturedProducts limit={4} /> {/* Integrated Featured Products Component at the bottom */}
    </div>
  );
}
