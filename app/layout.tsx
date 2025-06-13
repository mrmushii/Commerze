import "./globals.css";
import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
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
          <Navbar />
          <main className="container mx-auto p-4 pt-[60px]">
            {children}
          </main>

          <Toaster position="bottom-right" />

          <Footer/>

        </body>
      </html>
    </ClerkProvider>
  );
}