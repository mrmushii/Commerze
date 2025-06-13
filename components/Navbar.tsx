"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { IProduct } from "@/lib/type";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      const navElement = document.querySelector('nav.responsive-navbar');
      if (isMobileMenuOpen && navElement && !navElement.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/products/search?q=${encodeURIComponent(searchTerm.trim())}`
      );
      setShowSearchResults(false);
      searchInputRef.current?.blur();
      setIsMobileMenuOpen(false);
    }
  };

  return (

    <nav className="responsive-navbar relative w-full bg-gradient-to-br from-purple-100 to-pink-100 border-b border-gray-200 py-4 px-4 md:px-10 shadow-sm z-50">


      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-shrink-0 text-3xl font-extrabold text-black">
          <Link href="/">COMMERZE</Link>
        </div>

        <div className="flex items-center md:hidden ml-auto">
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


        <div className="hidden md:flex items-center flex-grow">
          <ul className="flex items-center space-x-6 flex-shrink-0 ml-8">
            <NavMenuLink href="/products" label="Shop" hasDropdown />
            <NavMenuLink href="/products/onsale" label="On Sale" />
            <NavMenuLink href="/products/newarrival" label="New Arrivals" />
            <NavMenuLink href="/about" label="About Us" />
          </ul>

          <div className="relative flex-grow mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative w-full max-w-md mx-auto px-4 sm:px-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 text-sm sm:text-base md:py-2.5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() =>
                    searchTerm.length > 0 && setShowSearchResults(true)
                  }
                />
              </div>

            </form>

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

        <div className="flex items-center justify-center space-x-4 flex-shrink-0">

          <div className="hidden md:block">
            <UserAuthSection />
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 w-full bg-white shadow-lg pb-4`}>
        <ul className="flex flex-col items-center space-y-4 pt-4">
          <NavMenuLink href="/products" label="Shop" hasDropdown onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/products/onsale" label="On Sale" onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/products/newarrival" label="New Arrivals" onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/contact" label="Contact" onClick={() => setIsMobileMenuOpen(false)} />
          <NavMenuLink href="/about" label="About Us" onClick={() => setIsMobileMenuOpen(false)} />

          <div className="mt-4 flex justify-center items-center pt-4 border-t w-full text-center">
            <UserAuthSection />
          </div>
        </ul>

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
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
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