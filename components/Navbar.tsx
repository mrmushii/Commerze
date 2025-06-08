import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center rounded-lg shadow-md m-2">
      <div className="text-xl font-bold">
        <Link href="/">My E-commerce</Link>
      </div>
      <ul className="flex space-x-4">
        <li>
          <Link href="/products" className="hover:underline">Products</Link>
        </li>
        <li>
          <Link href="/cart" className="hover:underline">Cart</Link>
        </li>
        <SignedIn>
          <li>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </li>
          <li>
            <Link href="/admin" className="hover:underline">Admin</Link>
          </li>
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