import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const ManualCountUp = ({ isCounting, end, duration }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isCounting) {
      setCount(0); 
      return;
    }

    const start = 0;
    const increment = end / (duration * 60);
    let current = 0;
    let startTime = null;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000); 

      if (progress < 1) {
        current = Math.min(end, start + increment * (timestamp - startTime) / (1000 / 60));
        setCount(Math.round(current));
        requestAnimationFrame(animateCount);
      } else {
        setCount(end); 
      }
    };

    requestAnimationFrame(animateCount);

  }, [isCounting, end, duration]); 

  return <>{count}</>;
};


const heroSlidesData = [
  {
    id: 1,
    title: (
      <>
        FIND CLOTHES <br /> THAT MATCHES <br /> YOUR STYLE
      </>
    ),
    description:
      "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
    buttonText: "Shop Now",
    buttonLink: "/products",
    imageSrc: "/herosec.jpg", 
    classname: "bg-gradient-to-br from-sky-200 via-rose-100 to-amber-100",
    stats: [
      { end: 200, label: "International Brands" },
      { end: 2000, label: "High-Quality Products" },
      { end: 30000, label: "Happy Customers" },
    ],
  },
  {
    id: 2,
    title: (
      <>
        DISCOVER YOUR <br /> UNIQUE LOOK <br /> TODAY
      </>
    ),
    description:
      "Explore exclusive collections and trending fashion pieces that speak to your personal style. New arrivals every week!",
    buttonText: "Explore Collections",
    buttonLink: "/products",
    imageSrc: "/herosec3.jpg",
    classname:"bg-gradient-to-br from-stone-600 via-amber-200 to-stone-400",
    stats: [
      { end: 50, label: "Exclusive Designers" },
      { end: 1500, label: "New Arrivals" },
      { end: 50000, label: "Community Members" },
    ],
  },
  {
    id: 3,
    title: (
      <>
        ELEVATE YOUR <br /> WARDROBE <br /> EFFORTLESSLY
      </>
    ),
    description:
      "From casual wear to elegant evening attire, find everything you need to create your perfect ensemble. Quality and comfort guaranteed.",
    buttonText: "View All Products",
    buttonLink: "/products",
    imageSrc: "/herosec1.jpg", 
    classname:"bg-gradient-to-br from-blue-200 to-gray-200",
    stats: [
      { end: 10, label: "Years in Business" },
      { end: 500, label: "Product Categories" },
      { end: 100000, label: "Global Reach" },
    ],
  },
  {
    id: 4,
    title: (
      <>
        DISCOVER YOUR <br /> UNIQUE LOOK <br /> TODAY
      </>
    ),
    description:
      "Explore exclusive collections and trending fashion pieces that speak to your personal style. New arrivals every week!",
    buttonText: "Explore Collections",
    buttonLink: "/products",
    imageSrc: "/herosec2.jpg",
    classname:"bg-gradient-to-tr from-green-100 via-lime-100 to-yellow-100",
    stats: [
      { end: 50, label: "Exclusive Designers" },
      { end: 1500, label: "New Arrivals" },
      { end: 50000, label: "Community Members" },
    ],
  },
];

const Hero = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1,
  });

  useEffect(() => {
    let interval;
    if (inView) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prevIndex) =>
          prevIndex === heroSlidesData.length - 1 ? 0 : prevIndex + 1
        );
      }, 7000); 
    }
    return () => clearInterval(interval); 
  }, [inView]); 
  const goToNextSlide = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === heroSlidesData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === 0 ? heroSlidesData.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const currentSlide = heroSlidesData[currentSlideIndex];

  return (
    <div
      ref={ref} 
      className={`min-h-screen md:h-screen w-full overflow-hidden relative transition-all duration-1000 ease-in-out ${currentSlide.classname}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {heroSlidesData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col md:flex-row justify-between z-10
              ${index === currentSlideIndex ? "block" : "hidden"}
              `}
          >
            
            <div
              className={`flex flex-col justify-center mt-10 items-center md:items-start w-full py-0 md:py-14 md:px-20 md:w-1/2 h-9/12
                ${inView && index === currentSlideIndex ? "slide-in-left" : "slide-out-left"}`}
            >
              <h1 className={`text-4xl md:text-5xl font-extrabold text-center md:text-start ${inView && index === currentSlideIndex ? 'animate-slide-in-left' : 'opacity-0'}`}>
                {slide.title}
              </h1>
              <p className={`py-5 text-slate-400 px-10 md:px-0 ${inView && index === currentSlideIndex ? 'animate-slide-in-left delay-150' : 'opacity-0'}`}>
                {slide.description}
              </p>
              
              <a
                href={slide.buttonLink}
                className={`inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 ${inView && index === currentSlideIndex ? 'animate-slide-in-left delay-300' : 'opacity-0'}`}
              >
                {slide.buttonText}
              </a>
              <div className="w-full py-10 flex flex-col md:flex-row justify-between items-center">
                <div className="flex justify-between gap-20 flex-wrap">
                  {slide.stats.map((stat, statIndex) => (
                    <span
                      key={statIndex}
                      className={`text-4xl font-semibold ${inView && index === currentSlideIndex ? `animate-slide-in-left delay-${500 + statIndex * 200}` : 'opacity-0'}`}
                    >
                      {/* Using ManualCountUp component */}
                      <ManualCountUp isCounting={inView && index === currentSlideIndex} end={stat.end} duration={3} />+
                      <p className="text-sm font-normal my-2 text-slate-500">
                        {stat.label}
                      </p>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            
            <Image
              src={slide.imageSrc}
              alt="Hero image"
              height={50}
              width={400}
              className={`w-full md:w-2/5 overflow-hidden ${inView && index === currentSlideIndex ? 'animate-slide-in-right delay-200' : 'opacity-0'}`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition z-20 focus:outline-none"
        aria-label="Previous slide"
      >
        &#10094; 
      </button>
      <button
        onClick={goToNextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition z-20 focus:outline-none"
        aria-label="Next slide"
      >
        &#10095;
      </button>

      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {heroSlidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${
              index === currentSlideIndex ? "scale-125 bg-opacity-100" : "bg-opacity-50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Hero;
