// app/page.tsx
import SearchComponent from '@/components/SearchComponent';
import FeaturedProducts from '@/components/FeaturedProducts';
import NewsletterSubscription from '@/components/NewsletterSubscription'; // We'll create this component
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-xl p-8 md:p-12 mb-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1200x500/60A5FA/C4B5FD?text=Fashion+Banner"
            alt="Fashion background"
            layout="fill"
            objectFit="cover"
            quality={80}
            className="opacity-20"
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-down">
            Style Your Story
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up">
            Discover the latest trends in clothing for every occasion.
          </p>
          <Link href="/products" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Find Your Perfect Outfit</h2>
        <SearchComponent /> {/* Integrated Search Component */}
        <p className="text-center text-gray-600 mt-4">
          Or <Link href="/products" className="text-blue-600 hover:underline">browse all our collections</Link>.
        </p>
      </section>

      {/* Featured Collections Section */}
      <FeaturedProducts limit={8} /> {/* Integrated Featured Products Component */}

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
      <section className="my-10 p-6 bg-gray-100 rounded-lg shadow-md">
        <NewsletterSubscription /> {/* Integrated Newsletter Component */}
      </section>
    </div>
  );
}
