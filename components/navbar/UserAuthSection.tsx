'use client';

import React from 'react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { CustomSessionClaims } from '@/lib/type'; // Ensure CustomSessionClaims is correctly imported
import { useUser, useAuth } from '@clerk/nextjs'; // Import useUser and useAuth for client-side role check
import { User2 } from 'lucide-react'; // Import a user icon for SignedOut state
import NavMenuLink from './NavMenuLink';


/**
 * A client-side component to handle user authentication status and display.
 * Shows Clerk's UserButton, Sign In/Sign Up links, and a conditional Admin badge.
 * Styled to match the image's icon-only user section.
 */
const UserAuthSection: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  // Determine if the client-side user has the admin role
  const isAdminClient = isSignedIn && (user?.publicMetadata as CustomSessionClaims['metadata'])?.role === 'admin';

  return (
    <>
      <SignedIn >
        {isAdminClient ? (
          // Admin text as a visual badge, no functionality
          <div className="flex gap-4 justify-center items-center">
            <ul>
              <NavMenuLink href="/admin/dashboard" label="Dashboard" />
            </ul>

            <span className="p-1 px-2 text-xs font-bold text-gray-800 bg-red-100 rounded-full mr-2">
              Admin
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex gap-4 justify-center items-center">
          <ul>
            <NavMenuLink href="/dashboard" label="Dashboard" />
          </ul>
          <UserButton afterSignOutUrl="/" />
          </div>
          
        )}
         {/* Clerk's UserButton */}
      </SignedIn>
      <SignedOut>
        <div className="flex items-center space-x-2">
          {/* Sign In Link - styled as an icon to match image aesthetic */}
          <Link href="/sign-in" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" title="Sign In">
            <User2 className="w-6 h-6 text-gray-800" />
          </Link>
          {/* Sign Up Link - if you want a separate icon/link for sign up */}
          {/* For now, just a user icon. You might combine sign-in/sign-up */}
          {/* <Link href="/sign-up" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <UserPlus className="w-6 h-6 text-gray-800" />
          </Link> */}
        </div>
      </SignedOut>
    </>
  );
};

export default UserAuthSection;