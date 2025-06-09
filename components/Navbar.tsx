// components/Navbar.tsx
'use client'; // Ensure this is a client component

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/nextjs'; // Import useAuth and useUser
import { useEffect } from 'react';
import { CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims interface

const Navbar = () => {
  const { isSignedIn, userId, isLoaded, sessionId } = useAuth(); // Add sessionId for debugging
  const { user } = useUser();

  useEffect(() => {
    console.log('--- Navbar (Client): Render Start ---');
    console.log('Client: isLoaded =', isLoaded);
    console.log('Client: isSignedIn =', isSignedIn);
    console.log('Client: userId =', userId);
    console.log('Client: sessionId =', sessionId); // Log the current session ID from client

    if (user && isLoaded) {
      // Log the full publicMetadata object from the client
      console.log('Client: user.publicMetadata (full object):', JSON.stringify(user.publicMetadata, null, 2));
      console.log('Client: user.publicMetadata.role =', (user.publicMetadata as CustomSessionClaims['metadata'])?.role);
    }
    console.log('--- Navbar (Client): Render End ---');
  }, [isLoaded, isSignedIn, userId, user, sessionId]); // Add sessionId to dependency array

  // Ensure client-side admin check is consistent
  const isAdminClient = isSignedIn && (user?.publicMetadata as CustomSessionClaims['metadata'])?.role === 'admin';

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center rounded-lg shadow-md m-2">
      <div className="text-xl font-bold">
        <Link href="/">Commerze</Link>
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link href="/products" className="hover:underline">Products</Link>
        </li>
        <li>
          <Link href="/cart" className="hover:underline">Cart</Link>
        </li>
        <SignedIn>
         {isAdminClient ? ( // Use the client-side calculated isAdminClient to conditionally render the link
            <li>
              <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>
            </li>
          ):
            <li>
              <Link href="/dashboard/orders" className="hover:underline">Dashboard</Link>
            </li>
          }
          {isAdminClient && ( // Use the client-side calculated isAdminClient to conditionally render the link
            <li>
              <Link href="/admin" className="hover:underline">Admin</Link>
            </li>
          )}
          <li>
            <UserButton afterSignOutUrl="/" />
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            <Link href="/sign-in" className="hover:underline">Sign In</Link>
          </li>
          <li>
            <Link href="/sign-up" className="hover:underline">Sign Up</Link>
          </li>
        </SignedOut>
      </ul>
    </nav>
  );
};

export default Navbar;