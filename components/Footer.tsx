import React from 'react'

// components/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t ">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Commerze</h3>
          <p className="text-sm text-gray-500">
            Your one-stop shop for stylish and affordable fashion.
          </p>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/products" className="hover:underline">Products</a></li>
            <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
            <li><a href="/contact" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-md font-semibold mb-2">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-black">Facebook</a>
            <a href="#" className="hover:text-black">Instagram</a>
            <a href="#" className="hover:text-black">Twitter</a>
          </div>
        </div>
      </div>

      <div className="border-t mt-6 text-center py-4 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Commerze. All rights reserved.
      </div>
    </footer>
  );
}
