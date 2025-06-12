// components/Navbar.tsx
"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs"; // Keep SignedIn/SignedOut for structural logic
import { useEffect, useState, useRef } from "react";
import { IProduct } from "@/lib/type"; // For search results typing
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react"; // Import Search, Menu, and X icons
import CartIconWithCount from "./navbar/CartIconWithCount";
import UserAuthSection from "./navbar/UserAuthSection";
import NavMenuLink from "./navbar/NavMenuLink";

const Navbar = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close search results dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search results if clicked outside search input/dropdown
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }

      // Close mobile menu if clicked outside nav itself
      const navElement = document.querySelector('nav.responsive-navbar'); // Assuming a unique class for your nav
      if (isMobileMenuOpen && navElement && !navElement.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]); // Add isMobileMenuOpen to dependencies

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/products/search?q=${encodeURIComponent(searchTerm.trim())}`
      );
      setShowSearchResults(false);
      searchInputRef.current?.blur();
      setIsMobileMenuOpen(false); // Close mobile menu on search submit
    }
  };

  return (

    <nav className="responsive-navbar relative w-full bg-white border-b border-gray-200 py-4 px-4 md:px-10 shadow-sm z-50">

   
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* SHOP.CO Logo */}
        <div className="flex-shrink-0 text-3xl font-extrabold text-black">
          <Link href="/">COMMERZE</Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen ? "true" : "false"}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop Navigation & Search (Hidden on Mobile) */}
        <div className="hidden md:flex items-center flex-grow">
          {/* Navigation Menu (Left of Search) */}
          <ul className="flex items-center space-x-6 flex-shrink-0 ml-8">
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
        </div>

        {/* Right Section: Cart and User Auth (Visible on all screen sizes) */}
        <div className="flex items-center justify-center space-x-4 flex-shrink-0">
          <CartIconWithCount />
          <div className="hidden md:block"> {/* Hide on small for mobile menu */}
            <UserAuthSection />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Expands from Hamburger) */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 w-full bg-white shadow-lg pb-4`}>
        <ul className="flex flex-col items-center space-y-4 pt-4">
          <NavMenuLink href="/products" label="Shop" hasDropdown onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/products/onsale" label="On Sale" onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/products/newarrival" label="New Arrivals" onClick={() => setIsMobileMenuOpen(false)} />
          {/* Add other core navigation links here if needed */}
          <NavMenuLink href="/contact" label="Contact" onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/about" label="About Us" onClick={() => setIsMobileMenuOpen(false)} />

          {/* User Auth Section for Mobile Menu (shown in mobile menu) */}
          <div className="mt-4 pt-4 border-t w-full text-center">
            <UserAuthSection />
          </div>
        </ul>

        {/* Search Bar for Mobile Menu (Optional: if you want it inside the dropdown) */}
        <div className="relative mx-4 mt-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)} // Delay hide to allow click on results
            />
          </form>
          {showSearchResults && searchTerm.length > 2 && (
             <div
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10"
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
                          src={product.imageUrls?.[0] || `https://placehold.it/30x30.png?text=Img`}
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
                          onClick={() => { setShowSearchResults(false); setIsMobileMenuOpen(false); }}
                        >
                          {product.name} - ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
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
      </div>
    </nav>
  );
};

export default Navbar;