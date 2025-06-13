"use client";
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { IReview } from "@/lib/type";
import axios from "axios";
import { formatDate } from "date-fns";

interface CustomerTestimonialsProps {
  title?: string;
  limit?: number;
}

const CustomerTestimonials: React.FC<CustomerTestimonialsProps> = ({
  title = "OUR HAPPY CUSTOMERS",
  limit,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = limit ? `?limit=${limit}` : "";
        const response = await axios.get(`/api/reviews${query}`);

        if (response.data.success) {
          setReviews(response.data.data);
        } else {
          setError(response.data.message || "Failed to load testimonials.");
        }
      } catch (err: unknown) {
        console.error("Error fetching testimonials:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [limit]);

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="my-8 p-6 py-16 bg-gray-50 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide mb-8">
          {title}
        </h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading customer testimonials...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-8 p-6 py-16 bg-gray-50 rounded-lg shadow-xl text-center text-red-600">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide mb-8">
          {title}
        </h2>
        <p>Error loading testimonials: {error}</p>
        <p className="text-sm">Please try again later.</p>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="my-8 p-6 py-16 bg-gray-50 rounded-lg shadow-xl text-center text-gray-600">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide mb-8">
          {title}
        </h2>
        <p>No customer reviews yet. Be the first to leave a review!</p>
      </section>
    );
  }

  return (
    <section className="my-8 p-6 py-16 bg-transparent rounded-lg hover:shadow-xl">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide">
            {title}
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
        >
          <div className="flex space-x-4">
            <CarouselPrevious className="p-5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </CarouselPrevious>
            <CarouselNext className="p-5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </CarouselNext>
          </div>
          <CarouselContent className="-ml-2">
            {reviews.map((review) => (
              <CarouselItem
                key={review._id.toString()}
                className="p-2 basis-[320px] sm:basis-[384px] flex-shrink-0 snap-center"
              >
                <div className="p-6 py-8 border-transparent bg-white rounded-lg shadow-md h-full">
                  <div className="flex items-center mb-3 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? "fill-current" : "fill-none"
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.203 9.091c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"
                        ></path>
                      </svg>
                    ))}
                  </div>

                  <div className="flex items-center mb-3">
                    {review.userImageUrl && (
                      <Image
                        src={review.userImageUrl}
                        alt={review.userName || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover mr-3 border-2 border-gray-200"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.userName}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm">
                    "{review.comment}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Reviewed on{" "}
                    {formatDate(new Date(review.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default CustomerTestimonials;