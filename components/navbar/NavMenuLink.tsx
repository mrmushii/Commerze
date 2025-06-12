'use client';

import Link from 'next/link';
import React from 'react';

interface NavMenuLinkProps {
  href: string;
  label: string;
  hasDropdown?: boolean; // For future dropdown functionality
}

/**
 * A reusable component for a single navigation link in the Navbar.
 * Styled to match the provided image's clean aesthetic.
 */
const NavMenuLink: React.FC<NavMenuLinkProps> = ({ href, label, hasDropdown = false }) => {
  return (
    <li className="relative">
      <Link href={href} className="text-gray-800 hover:text-gray-600 font-medium text-base transition-colors duration-200 py-2">
        {label}
      </Link>
      {hasDropdown && (
        <span className="ml-1 inline-block transform -rotate-90 text-gray-500">
          {/* Simple arrow for dropdown, can be Lucide ChevronDown */}
          &#9658;
        </span>
      )}
    </li>
  );
};

export default NavMenuLink;