import "./globals.css";
import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar"; // Import the Navbar
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Commerze",
  description: "A modern e-commerce platform built with Next.js and Clerk.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col">
          {/* Navbar at the top */}
          <Navbar /> {/* Include the Navbar here */}
          {/* FIX: Add padding-top to main content to account for fixed navbar */}
          <main className="container mx-auto p-4 pt-[60px]"> {/* Adjusted pt to roughly match py-4 (16px) + some navbar height if it's 64px tall */}
            {children}
          </main>

          {/* Toast notifications */}
          <Toaster position="bottom-right" />

          {/* Footer at the bottom */}
          <Footer/>
          
        </body>
      </html>
    </ClerkProvider>
  );
}

