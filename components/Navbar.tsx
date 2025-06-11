// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react'; // Import useState, useRef
import { CustomSessionClaims, IProduct } from '@/lib/type'; // Corrected import path for IProduct
import axios from 'axios'; // Import axios
import Image from 'next/image'; // Import Image
import { useRouter } from 'next/navigation'; // Import useRouter

const Navbar = () => {
  const { isSignedIn, userId, isLoaded, sessionId } = useAuth();
  const { user } = useUser();
  const router = useRouter(); // Initialize useRouter

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // For debugging purposes, remove in production
  useEffect(() => {
    console.log('--- Navbar (Client): Render Start ---');
    console.log('Client: isLoaded =', isLoaded);
    console.log('Client: isSignedIn =', isSignedIn);
    console.log('Client: userId =', userId);
    console.log('Client: sessionId =', sessionId);
    if (user && isLoaded) {
      console.log('Client: user.publicMetadata (full object):', JSON.stringify(user.publicMetadata, null, 2));
      console.log('Client: user.publicMetadata.role =', (user.publicMetadata as CustomSessionClaims['metadata'])?.role);
    }
    console.log('--- Navbar (Client): Render End ---');
  }, [isLoaded, isSignedIn, userId, user, sessionId]);

  // Determine if the client-side user has the admin role
  const isAdminClient = isSignedIn && (user?.publicMetadata as CustomSessionClaims['metadata'])?.role === 'admin';

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) { // Only search if more than 2 characters
        setSearchLoading(true);
        try {
          const response = await axios.get(`/api/products/search?q=${searchTerm}`);
          if (response.data.success) {
            setSearchResults(response.data.data);
            setShowSearchResults(true);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Navbar search error:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close search results dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearchResults(false); // Hide dropdown after navigation
      searchInputRef.current?.blur(); // Remove focus from input
    }
  };

  return (
    // Preserve existing nav styling
    <nav className="py-6 px-12 flex justify-between items-center rounded-lg shadow-md m-2 z-50 sticky">
      <div className="text-3xl font-extrabold">
        <Link href="/">Commerze</Link>
      </div>
      
      {/* Search Bar (Central in Navbar) */}
      <div className="relative flex-grow mx-4 max-w-md">
        <form onSubmit={handleSearchSubmit}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for products..."
            className="w-full p-2 pl-10 pr-4 rounded-full bg-white bg-opacity-90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 2 && setShowSearchResults(true)} // Show results if already fetched
          />
          {/* Search Icon - preserved existing style */}
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && searchTerm.length > 2 && (
          <div ref={searchDropdownRef} className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            {searchLoading ? (
              <p className="p-3 text-center text-gray-500">Searching...</p>
            ) : searchResults.length > 0 ? (
              <ul>
                {searchResults.map((product) => (
                  <li key={product._id.toString()} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                    <Image
                      src={product.imageUrls?.[0]}
                      alt={product.name}
                      width={30}
                      height={30}
                      className="rounded-md object-cover mr-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/30x30/F0F0F0/ADADAD?text=Img`; }}
                    />
                    <Link href={`/products/${product._id.toString()}`} className="text-sm text-gray-800 truncate" onClick={() => setShowSearchResults(false)}>
                      {product.name} - ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price} {/* Safely call toFixed */}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-center text-gray-500">No results found.</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links and User Controls */}
      <ul className="flex space-x-4">
        <li>
          {/* Preserving existing Link styling */}
          <Link href="/products" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Products</Link>
        </li>
        <li>
          {/* Preserving existing Link styling */}
          <Link href="/cart" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Cart</Link>
        </li>
        <SignedIn>
          {isAdminClient ? (
            <li>
              {/* Preserving existing Link styling */}
              <Link href="/admin/dashboard" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Dashboard</Link>
            </li>
          ) : (
            <li>
              {/* Preserving existing Link styling */}
              <Link href="/dashboard/orders" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Dashboard</Link>
            </li>
          )}
          
          {/* Conditional "Admin" Visual Text (Non-functional) */}
          {isAdminClient && (
            <li>
              {/* Applying visual styles as a span */}
              <span className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">
                Admin
              </span>
            </li>
          )}
          <li>
            <UserButton afterSignOutUrl="/" />
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            {/* Preserving existing Link styling */}
            <Link href="/sign-in" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Sign In</Link>
          </li>
          <li>
            {/* Preserving existing Link styling */}
            <Link href="/sign-up" className="inline-block px-4 py-2 rounded-full hover:shadow-lg bg-white hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">Sign Up</Link>
          </li>
        </SignedOut>
      </ul>
    </nav>
  );
};

export default Navbar;
