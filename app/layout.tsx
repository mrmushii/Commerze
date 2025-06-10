import './globals.css';
import type { Metadata } from 'next';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar'; // Import the Navbar



export const metadata: Metadata = {
  title: 'Commerze',
  description: 'A modern e-commerce platform built with Next.js and Clerk.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body >
          <Navbar /> {/* Include the Navbar here */}
          <main className="container  mx-auto p-4 mt-16">
            {children}
          </main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}