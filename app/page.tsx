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
    <div className="container mx-auto m-[-60px]">
      <Hero/>
      <div className="h-20 w-full relative z-40 top-[-80px] bg-black text-white grid grid-cols-3 md:grid-cols-5 justify-items-center items-center">
        <Image src={"/versage.png"} width={120} height={70} alt='logo'/>
        <Image src={"/zara.png"} width={80} height={50} alt='logo'/>
        <Image src={"/gucci.png"} width={120} height={70} alt='logo'/>
        <Image src={"/prada.png"} width={120} height={70} alt='logo'/>
        <Image src={"/calvin.png"} width={140} height={90} alt='logo'/>
      </div>
      {/* Search Section */}
      <section className="pt-2 bg-white rounded-2xl shadow-lg text-center border border-gray-200">
        <Suspense fallback={
          <div className="text-center p-8">
            <p className="text-gray-600">Loading search options...</p>
          </div>
        }>
          <SearchComponent /> {/* Integrated Search Component */}
        </Suspense>
        {/* <p className="text-center text-gray-600 mt-4">
          Or <Link href="/products" className="text-blue-600 hover:underline">browse all our collections</Link>
        </p> */}
      </section>

     
      <div className='flex flex-col justify-center '>
        <NewArrivals limit={4}/>
        <div className='flex justify-center items-center'>
          <Link
    href="/products/newarrival"
    className="inline-block px-8 py-4 mb-9 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300"
  >
    View All
  </Link>
        </div>
      </div>
      <hr />
      {/* Featured Collections Section */}
      <div className='flex flex-col justify-center '>
        <FeaturedProducts limit={4} title='TOP SELLING'/>
        <div className='flex justify-center items-center'>
          <Link
    href="/products/newarrival"
    className="inline-block px-8 py-4 mb-9 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300"
  >
    View All
  </Link>
        </div>
      </div>
       {/* Integrated Featured Products Component */}

      <Browse/>

      {/* Search Section */}
      <section className="my-12 p-8 pb-14 bg-white rounded-2xl shadow-lg text-center border border-gray-200">
        <Suspense fallback={
          <div className="text-center p-8">
            <p className="text-gray-600">Loading search options...</p>
          </div>
        }>
          <SearchComponent /> {/* Integrated Search Component */}
        </Suspense>
        {/* <p className="text-center text-gray-600 mt-4">
          Or <Link href="/products" className="text-blue-600 hover:underline">browse all our collections</Link>
        </p> */}
      </section>

      {/* About Us / Advertisements Section */}
      <Advertise/>

      {/* Newsletter Subscription Section */}
        <CustomerTestimonials/>
        <NewsletterSubscription /> {/* Integrated Newsletter Component */}
    </div>
  );
}
