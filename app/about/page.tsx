import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="container mx-auto mt-8 px-4 py-8">
      <div className="text-gray-600 text-sm mb-4">
        <Link href="/" className="hover:underline">Home</Link> &gt; About Us
      </div>

      <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-12 tracking-tight leading-tight">
        Discover Our Story: Where Tradition Meets Trend
      </h1>

      <section className="relative h-96 md:h-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl overflow-hidden mb-12">
        <Image
          src="https://placehold.it/1400x700.png?text=Chittagong+Port+Fashion"
          alt="About Us Banner - Chittagong backdrop"
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 80vw"
          className="opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black bg-opacity-30">
          <p className="text-2xl md:text-3xl font-semibold text-white text-center drop-shadow-md">
            Connecting global fashion with the heart of Bangladesh.
          </p>
        </div>
      </section>

      <section className="mb-12 bg-white rounded-xl shadow-lg p-8 lg:p-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b pb-4">Our Story</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-gray-700 leading-relaxed">
          <div>
            <p className="mb-4">
              Commerze began with a simple vision: to blend the rich textile heritage and vibrant culture of Chittagong, Bangladesh, with contemporary global fashion trends. Founded by a team deeply rooted in the local community, our journey started from understanding the intricate craftsmanship and dedication of local artisans.
            </p>
            <p>
              We realized the immense potential of bringing high-quality, ethically sourced apparel directly to you, cutting out unnecessary intermediaries. Our aim is to celebrate authentic Bangladeshi talent while offering modern, stylish, and comfortable clothing that speaks to a global audience.
            </p>
          </div>
          <div>
            <p className="mb-4">
              Every stitch tells a story of passion and precision. From the bustling markets of Chittagong to the serene beauty of its landscapes, our inspiration is drawn from a place where history intertwines with innovation. We are committed to fostering sustainable practices and supporting the very hands that create our beautiful collections.
            </p>
            <p>
              More than just an e-commerce store, Commerze is a bridge. A bridge connecting conscious consumers with exceptional craftsmanship, and a bridge between tradition and the ever-evolving world of style.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12 bg-gray-50 rounded-xl shadow-lg p-8 lg:p-10">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-10 border-b pb-4">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-center">
            <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002.944 12c0 4.908 3.069 9.032 7.348 10.598A12.007 12.007 0 0012 21.056c4.908 0 9.032-3.069 10.598-7.348A12.007 12.007 0 0021.056 12c0-4.908-3.069-9.032-7.348-10.598z"></path></svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Craftsmanship</h3>
            <p className="text-gray-700 text-sm">Every garment is a testament to meticulous attention to detail and superior quality.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-center">
            <svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.202 5 7.5 5A6.5 6.5 0 003 11.5c0 1.657.382 3.243 1.077 4.654L9.5 21l-2.003-3.655M16.5 5c1.708 0 3.23.477 4.498 1.253m-4.498 0l-3.327 6.227m-5.485 2.115L15 21l2.003-3.655M18.5 11.5a6.5 6.5 0 10-13 0 6.5 6.5 0 0013 0z"></path></svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ethical & Sustainable</h3>
            <p className="text-gray-700 text-sm">Committed to fair labor practices and environmentally friendly processes.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 text-center">
            <svg className="w-12 h-12 text-purple-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation in Style</h3>
            <p className="text-gray-700 text-sm">Always bringing you the latest trends fused with timeless elegance.</p>
          </div>
        </div>
      </section>

      <section className="mb-12 bg-white rounded-xl shadow-lg p-8 lg:p-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b pb-4">Our Roots: Proudly from Chittagong</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-gray-700 leading-relaxed items-center">
          <div>
            <p className="mb-4">
              Our journey is deeply interwoven with the vibrant city of Chittagong, Bangladesh. Known for its rich history as a port city, its diverse culture, and a burgeoning textile industry, Chittagong provides the backdrop and the talent for our collections. We work closely with local factories and craftspeople, ensuring fair wages and safe working conditions.
            </p>
            <p>
              By choosing Commerze, you're not just getting quality apparel; you're also supporting local communities and contributing to the economic growth and recognition of Bangladeshi craftsmanship on the global stage. We are proud to be a part of Chittagong's story.
            </p>
          </div>
          <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
            <Image
              src="/ctg.jpg"
              alt="Chittagong Culture"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="text-center bg-blue-50 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Ready to Experience Commerze?</h2>
        <Link href="/products" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
          Shop Our Collections
        </Link>
      </section>
    </div>
  );
}