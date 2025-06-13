// app/products/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { IProduct } from '@/lib/type';
import SearchComponent from '@/components/SearchComponent';
import FeaturedProducts from '@/components/FeaturedProducts';
import NewArrivals from '@/components/NewArrivals';
import { Menu } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Men', 'Women', 'Kids'];
  const types = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const colors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Brown', 'Purple', 'Pink'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedType) params.append('type', selectedType);

        params.append('minPrice', priceRange[0].toString());
        params.append('maxPrice', priceRange[1].toString());

        if (selectedColor) params.append('color', selectedColor);
        if (selectedSize) params.append('size', selectedSize);
        if (selectedGender) params.append('gender', selectedGender);

        const queryString = params.toString();
        console.log("Fetching products with query:", queryString);
        const response = await fetch(`/api/products/search?${queryString}`);
        const data = await response.json();

        if (response.ok && data.success) {
          console.log("Fetched products successfully:", data.data.length, "items");
          setProducts(data.data);
        } else {
          console.error("Failed to fetch products from API:", data.message);
          setError(data.message || 'Failed to fetch products.');
        }
      } catch (err: unknown) {
        console.error('Error fetching products (network/unexpected):', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedType, priceRange, selectedColor, selectedSize, selectedGender]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setPriceRange([0, 500]);
    setSelectedColor('');
    setSelectedSize('');
    setSelectedGender('');
    toast.success('All filters cleared!');
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange([value, Math.max(value, priceRange[1])]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPriceRange([Math.min(value, priceRange[0]), value]);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderSidebarContent = () => (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Filters</h2>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="sidebarSearch" className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
        <input
          type="text"
          id="sidebarSearch"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Main Category */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Main Category</h3>
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              className={`w-full text-left px-4 py-2 rounded-md transition duration-200 ${
                selectedCategory === cat ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clothing Type */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Clothing Type</h3>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">All Types</option>
          {types.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {/* Gender */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Gender</h3>
        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">All Genders</option>
          {genders.map(gender => <option key={gender} value={gender}>{gender}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Price</h3>
        <div className="mb-4 text-center font-medium text-gray-700">
          ${priceRange[0]} - ${priceRange[1]}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full mb-4">
          <div
            className="absolute h-full bg-blue-600 rounded-full"
            style={{ left: `${(priceRange[0] / 500) * 100}%`, width: `${((priceRange[1] - priceRange[0]) / 500) * 100}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            className="absolute w-full h-full appearance-none bg-transparent"
            style={{ top: 0, left: 0, zIndex: 2 }}
          />
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={handleMaxPriceChange}
            className="absolute w-full h-full appearance-none bg-transparent"
            style={{ top: 0, left: 0, zIndex: 2 }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6 border-b pb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Colors</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(selectedColor === color.toLowerCase() ? '' : color.toLowerCase())}
              style={{ backgroundColor: color.toLowerCase() }}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color.toLowerCase() ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
              title={color}
            />
          ))}
          <button
            onClick={() => setSelectedColor('')}
            className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 text-xs ${
              selectedColor === '' ? 'border-blue-500 ring-2 ring-blue-500' : ''
            }`}
            title="Clear Color"
          >
            All
          </button>
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Size</h3>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm">
          <option value="">Any Size</option>
          {sizes.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={handleClearFilters}
        className="w-full px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
      >
        Clear All Filters
      </button>
    </>
  );

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-30"> 
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Menu className="w-8 h-8 text-gray-700 rounded-sm p-1 hover:bg-secondary" />
        </button>
      </div>

      <aside className="hidden md:block md:w-1/4 p-6 bg-white rounded-lg shadow-md sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
        {renderSidebarContent()}
      </aside>

      <div className={`fixed inset-0 z-40 bg-black/25 md:hidden transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute left-0 top-0 h-full w-3/4 bg-white p-6 shadow-lg transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <div className="overflow-y-auto h-full pr-2">
            {renderSidebarContent()}
          </div>
        </div>
      </div>

      <main className="md:w-3/4 ">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Collections</h1>

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
            <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-9">
            {products.map((product) => (
              <div key={product._id.toString()} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
                <Link href={`/products/${product._id.toString()}`}>
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={product.imageUrls?.[0] || `https://placehold.co/400x300/F0F0F0/ADADAD?text=No+Image`}
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
                    <p className="text-gray-600 mb-2">{product.category}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">${product.price.toFixed(2)}</p>
                    {product.stock === 0 ? (
                      <p className="text-red-500 font-medium mt-2">Out of Stock</p>
                    ) : (
                      <p className="text-green-600 font-medium mt-2">In Stock: {product.stock}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        <FeaturedProducts title="Top Sellers You Might Love" limit={4} />

        <NewArrivals limit={4} />
      </main>
    </div>
  );
}