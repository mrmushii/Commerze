import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar'; // Import the Navbar

const inter = Inter({ subsets: ['latin'] });

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
        <body className={inter.className}>
          <Navbar /> {/* Include the Navbar here */}
          <main className="container mx-auto p-4">
            {children}
          </main>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}