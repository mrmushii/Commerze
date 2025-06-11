// components/SearchComponent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IProduct } from '@/lib/type'; // Import IProduct type
import Image from 'next/image';
import Link from 'next/link';

interface SearchComponentProps {
  // Optional prop to indicate if it's used on a dedicated search results page
  // where results are displayed directly within the component
  isSearchResultsPage?: boolean;
}

/**
 * A reusable client-side component for searching and filtering products.
 * It fetches results from `/api/products/search`.
 * Can display search results directly or navigate to a search results page.
 */
const SearchComponent: React.FC<SearchComponentProps> = ({ isSearchResultsPage = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');

  const categories = ['Men', 'Women', 'Kids'];
  const types = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const colors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Brown', 'Purple', 'Pink']; // Example colors
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Example sizes
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];


  // Effect to perform search when searchTerm or filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 0 || selectedCategory || selectedType || minPrice || maxPrice || selectedColor || selectedSize || selectedGender) {
        performSearch();
      } else {
        setSearchResults([]); // Clear results if search term is empty
      }
    }, 300); // Debounce search to prevent too many API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedType, minPrice, maxPrice, selectedColor, selectedSize, selectedGender]);


  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async () => {
    setLoading(true);
    setShowDropdown(true); // Show dropdown when search starts
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (selectedColor) params.append('color', selectedColor);
      if (selectedSize) params.append('size', selectedSize);
      if (selectedGender) params.append('gender', selectedGender);


      const queryString = params.toString();
      const response = await fetch(`/api/products/search?${queryString}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
        console.error('Search API error:', data.message);
      }
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearchResultsPage) {
      // If on search results page, update URL and fetch results
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (selectedColor) params.append('color', selectedColor);
      if (selectedSize) params.append('size', selectedSize);
      if (selectedGender) params.append('gender', selectedGender);

      router.push(`/products/search?${params.toString()}`);
    } else {
      // If not on search results page, just perform search and show dropdown
      performSearch();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Search for clothes by name, material..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length > 0 && setShowDropdown(true)} // Show dropdown on focus if term exists
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
        >
          Search
        </button>
      </form>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option value="">All</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Clothing Type</label>
          <select id="type" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option value="">All</option>
            {types.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
          <select id="gender" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option value="">All</option>
            {genders.map(gender => <option key={gender} value={gender}>{gender}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">Min Price</label>
          <input type="number" id="minPrice" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Min" />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">Max Price</label>
          <input type="number" id="maxPrice" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Max" />
        </div>
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
          <select id="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option value="">All</option>
            {colors.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
          <select id="size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm">
            <option value="">All</option>
            {sizes.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
      </div>


      {!isSearchResultsPage && showDropdown && searchTerm.length > 0 && (
        <div ref={dropdownRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-center text-gray-500">Searching...</p>
          ) : searchResults.length > 0 ? (
            <ul>
              {searchResults.map((product) => (
                <li key={product._id.toString()} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0">
                  <Image
                    src={product.imageUrls[0] || `https://placehold.co/40x40/F0F0F0/ADADAD?text=Img`} // Use first image from imageUrls
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover mr-3"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/40x40/F0F0F0/ADADAD?text=Img`; }}
                  />
                  <Link href={`/products/${product._id.toString()}`} className="flex-grow text-gray-800 font-medium" onClick={() => setShowDropdown(false)}>
                    {product.name} - ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-gray-500">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
