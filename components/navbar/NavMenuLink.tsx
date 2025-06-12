'use client';

import Link from 'next/link';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface NavMenuLinkProps {
  href: string;
  label: string;
  hasDropdown?: boolean;
}

const NavMenuLink: React.FC<NavMenuLinkProps> = ({ href, label, hasDropdown = false }) => {
  const shopCategories = [
    { label: 'All Products', type: '' },
    { label: 'Men', type: 'Men' },
    { label: 'Women', type: 'Women' },
    { label: 'Kids', type: 'Kids' },
  ];

  if (hasDropdown) {
    return (
      <li className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center text-gray-800 hover:text-gray-600 font-medium text-base transition-colors duration-200 py-2 focus:outline-none">
              {label}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mt-2 bg-white shadow-lg rounded-md p-2">
            {shopCategories.map((category) => (
              <DropdownMenuItem asChild key={category.type || 'all'}>
                <Link href={`/products?category=${encodeURIComponent(category.type)}`} className="w-full focus:bg-gray-100 py-1.5 px-2 rounded-md text-gray-800 hover:text-gray-600">{category.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  }

  return (
    <li className="relative">
      <Link
        href={href}
        className="text-gray-800 hover:text-gray-600 font-medium text-base transition-colors duration-200 py-2"
      >
        {label}
      </Link>
    </li>
  );
};

export default NavMenuLink;
