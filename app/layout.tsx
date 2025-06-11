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
          <Navbar />

          {/* Main content area */}
          <main className="flex-grow container mx-auto p-4 mt-16">
            {children}
            
          </main>

          {/* Toast notifications */}
          <Toaster position="top-right" />

          {/* Footer at the bottom */}
          <Footer/>
          
        </body>
      </html>
    </ClerkProvider>
  );
}

