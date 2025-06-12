'use client';

import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';

const Browse = () => {
  const router = useRouter();
  
  const dressStyles = [
    { name: 'Casual', image: '/cas.png', type: 'Casual',className:"col-span-full md:col-start-1 md:col-span-2 md:row-span-3" },
    { name: 'Formal', image: '/formal.png', type: 'Formal',className:"col-span-3 row-span-3 col-start-3" },
    { name: 'Party', image: '/party.png', type: 'Party',className:"col-span-3 row-span-3 col-start-1 row-start-4" },
    { name: 'Gym', image: '/sports.png', type: 'Gym',className: "col-span-2 row-span-3 col-start-4 row-start-4"},
  ];

  const handleClick = (type: string) => {
    router.push(`/products?type=${encodeURIComponent(type)}`);
  };

  return (
    <section className="bg-gray-100 rounded-2xl p-6 sm:p-10 max-w-5xl mx-auto mt-10">
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-black mb-6 uppercase">
        Browse By Dress Style
      </h2>
      <div className="flex flex-col gap-4 md:hidden">
        {dressStyles.map((style) => (
          <button
            key={style.type}
            onClick={() => handleClick(style.type)}
            className="relative rounded-xl overflow-hidden group h-40 focus:outline-none"
          >
            <Image
              src={style.image}
              alt={style.name}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-3 py-1 rounded-md text-md md:text-lg font-bold text-gray-800">
              {style.name}
            </div>
          </button>
        ))}
      </div>
      <div className="block md:grid grid-cols-2 gap-4 sm:gap-6 max-md:hidden">
        {dressStyles.map((style) => (
          <button
            key={style.type}
            onClick={() => handleClick(style.type)}
            className={`relative rounded-xl overflow-hidden group focus:outline-none ${style.className}`}
          >
            <Image
              src={style.image}
              alt={style.name}
              width={500}
              height={300}
              className="object-cover w-full h-36 sm:h-48 group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4  bg-opacity-80 px-3 py-1 rounded-md text-sm sm:text-base md:text-lg font-semibold text-gray-800">
              {style.name}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Browse;
