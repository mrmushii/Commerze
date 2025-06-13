'use client';

import React from 'react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { CustomSessionClaims } from '@/lib/type'; 
import { useUser, useAuth } from '@clerk/nextjs'; 
import { User2 } from 'lucide-react'; 
import NavMenuLink from './NavMenuLink';
import CartIconWithCount from './CartIconWithCount';


const UserAuthSection: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  const isAdminClient = isSignedIn && (user?.publicMetadata as CustomSessionClaims['metadata'])?.role === 'admin';

  return (
    <>
      <SignedIn >
        {isAdminClient ? (
          <div className="flex gap-4 justify-center items-center">
            <CartIconWithCount/>
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
            <CartIconWithCount/>
          <ul>
            <NavMenuLink href="/dashboard" label="Dashboard" />
          </ul>
          <UserButton afterSignOutUrl="/" />
          </div>
          
        )}
      </SignedIn>
      <SignedOut>
        <div className="flex items-center space-x-2">
          <Link href="/sign-in" className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" title="Sign In">
            <User2 className="w-6 h-6 text-gray-800" />
          </Link>
          
        </div>
      </SignedOut>
    </>
  );
};

export default UserAuthSection;