import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript:{
    ignoreBuildErrors: true,
  },
   images: {
    domains: ['www.lg.com', 'placehold.co', 'another-domain.com',
       'via.placeholder.com', // Add this hostname
      'placehold.it',      
    ], // Add all your external image hosts here
  },
};

export default nextConfig;
