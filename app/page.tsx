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
import CustomerTestimonials from '@/components/CustomerTestimonials';
import Advertise from '@/components/Advertise';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
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
      <section className="my-12 p-8 pb-14 bg-white rounded-2xl shadow-lg text-center border border-gray-200">
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
      <Advertise/>

      {/* Newsletter Subscription Section */}
        <CustomerTestimonials/>
        <NewsletterSubscription /> {/* Integrated Newsletter Component */}
    </div>
  );
}
