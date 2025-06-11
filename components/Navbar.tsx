// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react'; // Import useState, useRef
import { CustomSessionClaims, IProduct, CartItem } from '@/lib/type'; // Import CartItem for type consistency
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react'; // Import ShoppingCart icon from lucide-react

const Navbar = () => {
  const { isSignedIn, userId, isLoaded, sessionId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [cartItemCount, setCartItemCount] = useState(0); // State for cart item count


  // Function to update cart item count from localStorage
  const updateCartItemCount = () => {
    if (typeof window !== 'undefined') { // Ensure client-side
      const storedCart = localStorage.getItem('cart');
      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
      setCartItemCount(cart.length);
    }
  };

  // Listen for storage events (when cart is updated in localStorage)
  useEffect(() => {
    updateCartItemCount(); // Initial count on mount

    const handleStorageChange = () => {
      updateCartItemCount();
    };

    window.addEventListener('storage', handleStorageChange);
    // For direct calls to localStorage.setItem from other components,
    // you might need a custom event or a context for more granular updates.
    // However, the 'storage' event covers changes from different tabs/windows.

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array means this runs once on mount


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
    console.log('--- Navbar (Client): Cart Item Count =', cartItemCount); // Log cart count
    console.log('--- Navbar (Client): Render End ---');
  }, [isLoaded, isSignedIn, userId, user, sessionId, cartItemCount]); // Add cartItemCount to dependency array


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
                      src={product.imageUrls?.[0] || `https://placehold.co/30x30/F0F0F0/ADADAD?text=Img`} // Use first image from imageUrls
                      alt={product.name}
                      width={30}
                      height={30}
                      // FIX: Replaced objectFit with style, and added sizes prop
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 30px, 30px" // Appropriate sizes for small thumbnail
                      className="rounded-md mr-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/30x30/F0F0F0/ADADAD?text=Img`; }}
                    />
                    <Link href={`/products/${product._id.toString()}`} className="flex-grow text-sm text-gray-800 truncate" onClick={() => setShowSearchResults(false)}>
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
      <ul className="flex items-center space-x-4">
        <li>
          {/* Preserving existing Link styling */}
          <Link href="/products" className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">Products</Link>
        </li>
        {/* Cart Icon with Dynamic Count */}
        
        <SignedIn>
          {isAdminClient ? (
            <li>
              {/* Preserving existing Link styling */}
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">Dashboard</Link>
            </li>
          ) : (
            <li>
              {/* Preserving existing Link styling */}
              <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">Dashboard</Link>
            </li>
          )}
          <li>
          <Link href="/cart" className="relative flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">
            <ShoppingCart className="w-5 h-5" /> {/* Lucide React ShoppingCart icon */}
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </li>
          {/* Conditional "Admin" Visual Text (Non-functional) */}
          <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">
            <UserButton afterSignOutUrl="/" />

            {isAdminClient && (
              <span className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full border-none ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12l2 2 4-4M7 12a5 5 0 0110 0 5 5 0 01-10 0z"
                  />
                </svg>
                Admin
              </span>
            )}
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            {/* Preserving existing Link styling */}
            <Link href="/sign-in" className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">Sign In</Link>
          </li>
          <li>
            {/* Preserving existing Link styling */}
            <Link href="/sign-up" className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-none  hover:shadow-md transition duration-200">Sign Up</Link>
          </li>
        </SignedOut>
      </ul>
    </nav>
  );
};

export default Navbar;
