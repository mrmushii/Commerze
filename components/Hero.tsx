import React from "react";
import Link from "next/link";
import CountUp from "react-countup";
import { Client } from "@clerk/nextjs/server";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex justify-between z-0">
        <div className="flex flex-col justify-center mt-10 items-center md:items-start w-full p-0 md:px-20 md:w-1/2 h-9/12">
          <h1 className="text-5xl font-extrabold">
            FIND CLOTHES <br /> THAT MATCHES <br /> YOUR STYLE
          </h1>
          <p className="py-5 text-slate-400">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 animate-fade-in-up delay-300"
          >
            Shop Now
          </Link>
          <div className="w-full py-10 flex justify-between">
            <span className="text-4xl font-semibold">
              <CountUp isCounting end={200} duration={3} />+
              <p className="text-sm font-normal my-2 text-slate-500">
                International Brands
              </p>
            </span>
            <span className="text-4xl font-semibold">
              <CountUp isCounting end={2000} duration={3} />+
              <p className="text-sm font-normal my-2 text-slate-500">
                High-Quality Products
              </p>
            </span>
            <span className="text-4xl font-semibold">
              <CountUp isCounting end={30000} duration={2.8} />+
              <p className="text-sm font-normal my-2 text-slate-500">
                Happy Customers
              </p>
            </span>
          </div>
        </div>
        <Image
          src={"/hero.jpg"}
          height={50}
          width={400}
          alt="image"
          className="w-2/5 h-1/2"
        />
      </div>
      <div className="h-20 w-full relative bg-black z-10 text-white">hey</div>
    </div>
  );
};

export default Hero;
