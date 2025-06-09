// app/admin/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { CustomSessionClaims } from '@/lib/type';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  console.log('--- AdminDashboardPage (Server): Render Start ---');

  const { userId, sessionClaims } = await auth();

  // Debug output
  console.log('Server: Raw userId:', userId);
  console.log('Server: Raw sessionClaims (full object):', JSON.stringify(sessionClaims, null, 2));

  const claims = sessionClaims as CustomSessionClaims;

  // ✅ Fixed: use public_metadata instead of metadata
  const isAdmin = claims?.public_metadata?.role === 'admin';

  console.log('Server: claims?.public_metadata?.role:', claims?.public_metadata?.role);
  console.log('Server: isAdmin calculated:', isAdmin);

  if (!userId || !isAdmin) {
    console.log('Server: Unauthorized access or not admin, redirecting to /sign-in');
    redirect('/sign-in');
  }

  await dbConnect();
  const productCount = await Product.countDocuments({});
  console.log('Server: Product Count:', productCount);
  console.log('--- AdminDashboardPage (Server): Render End ---');

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <p className="text-lg text-gray-700 mb-4">Welcome back, Admin!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold text-blue-800">Products</h2>
          <p className="text-3xl font-bold text-blue-900">{productCount}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <ul className="list-disc list-inside text-blue-600">
          <li><Link href="/admin/products" className="hover:underline">Manage Products</Link></li>
          <li><Link href="/admin/orders" className="hover:underline">Manage Orders</Link></li>
        </ul>
      </div>
    </div>
  );
}
