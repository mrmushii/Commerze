"use client"
// app/page.tsx
import SearchComponent from '@/components/SearchComponent';
import FeaturedProducts from '@/components/FeaturedProducts';
import NewsletterSubscription from '@/components/NewsletterSubscription'; // We'll create this component
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/Hero';
import { Suspense } from 'react';
import NewArrivals from '@/components/NewArrivals';
import Browse from '@/components/Browse';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 bg-secondary z-30 absolute">
      <Hero/>
      <div className="h-20 w-full relative z-40 top-[-80px] bg-black text-white grid grid-cols-3 md:grid-cols-5 justify-items-center items-center">
        <Image src={"/versage.png"} width={120} height={70} alt='logo'/>
        <Image src={"/zara.png"} width={80} height={50} alt='logo'/>
        <Image src={"/gucci.png"} width={120} height={70} alt='logo'/>
        <Image src={"/prada.png"} width={120} height={70} alt='logo'/>
        <Image src={"/calvin.png"} width={140} height={90} alt='logo'/>
      </div>
      <NewArrivals/>

      {/* Featured Collections Section */}
      <FeaturedProducts limit={8} title='TOP SELLING'/> {/* Integrated Featured Products Component */}

      <Browse/>

      {/* Search Section */}
      <section className="mb-10 bg-white py-5">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 bg-white z-20">Find Your Perfect Outfit</h2>
        <Suspense fallback={
          <div className="text-center p-8">
            <p className="text-gray-600">Loading search options...</p>
          </div>
        }>
          <SearchComponent /> {/* Integrated Search Component */}
        </Suspense>
        <p className="text-center text-gray-600 mt-4">
          Or <Link href="/products" className="text-blue-600 hover:underline">browse all our collections</Link>
        </p>
      </section>

      {/* About Us / Advertisements Section */}
      <section className="my-10 p-6 bg-purple-50 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-purple-800">Quality & Style Guaranteed</h2>
        <p className="text-lg text-gray-700 mb-6">
          At Commerze, we believe in combining comfort with the latest fashion. Our curated collection ensures you always look your best.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainable Fashion</h3>
            <p className="text-gray-600 text-sm">Committed to eco-friendly materials and ethical production.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Expertly Curated</h3>
            <p className="text-gray-600 text-sm">Hand-picked styles to keep you ahead of the trends.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Satisfaction</h3>
            <p className="text-gray-600 text-sm">Your happiness is our priority, with easy returns and support.</p>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
    
        <NewsletterSubscription /> {/* Integrated Newsletter Component */}
    </div>
  );
}
