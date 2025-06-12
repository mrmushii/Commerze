// components/Navbar.tsx
"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs"; // Keep SignedIn/SignedOut for structural logic
import { useEffect, useState, useRef } from "react";
import { IProduct } from "@/lib/type"; // For search results typing
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react"; // Import Search icon for the bar
import CartIconWithCount from "./navbar/CartIconWithCount"; // Import new Cart component
import UserAuthSection from "./navbar/UserAuthSection"; // Import new User/Auth component
import NavMenuLink from "./navbar/NavMenuLink"; // Import new Nav Link component

const Navbar = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setSearchLoading(true);
        try {
          const response = await axios.get(
            `/api/products/search?q=${searchTerm}`
          );
          if (response.data.success) {
            setSearchResults(response.data.data);
            setShowSearchResults(true);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Navbar search error:", error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close search results dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/products/search?q=${encodeURIComponent(searchTerm.trim())}`
      );
      setShowSearchResults(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <nav className="relative w-full bg-white border-b border-gray-200 py-7 px-6 md:px-10 shadow-sm z-50">
      {" "}
      {/* Base nav styling */}
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* SHOP.CO Logo */}
        <div className="flex-shrink-0 text-3xl font-extrabold text-black">
          <Link href="/">COMMERZE</Link>
        </div>

        {/* Navigation Menu (Left of Search) */}
        <ul className="hidden md:flex items-center space-x-6 flex-shrink-0 ml-8">
          <NavMenuLink href="/products" label="Shop" hasDropdown />
          <NavMenuLink href="/products/onsale" label="On Sale" />
          <NavMenuLink href="/products/newarrival" label="New Arrivals" />
          
        </ul>

        {/* Search Bar (Centered and Expands) */}
        <div className="relative flex-grow mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() =>
                searchTerm.length > 0 && setShowSearchResults(true)
              }
            />
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchTerm.length > 2 && (
            <div
              ref={searchDropdownRef}
              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10"
            >
              {searchLoading ? (
                <p className="p-3 text-center text-gray-500">Searching...</p>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((product) => (
                    <li
                      key={product._id.toString()}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <Image
                        src={
                          product.imageUrls?.[0] ||
                          `https://placehold.it/30x30.png?text=Img`
                        }
                        alt={product.name}
                        width={30}
                        height={30}
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 30px, 30px"
                        className="rounded-md mr-2"
                      />
                      <Link
                        href={`/products/${product._id.toString()}`}
                        className="flex-grow text-sm text-gray-800 truncate"
                        onClick={() => setShowSearchResults(false)}
                      >
                        {product.name} - $
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : product.price}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 text-center text-gray-500">
                  No results found.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Cart and User Auth */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <CartIconWithCount /> {/* Cart icon with dynamic count */}
          <UserAuthSection /> {/* User button / Sign In/Sign Up */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
