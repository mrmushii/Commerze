import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

/**
 * Page for adding a new product to the e-commerce store.
 * Requires admin authentication.
 */
export default async function NewProductPage() {
  const { userId, sessionClaims } = auth();

  // Redirect if not signed in or not an admin
  if (!userId || sessionClaims?.metadata?.role !== 'admin') {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Add New Product</h1>
      <ProductForm />
    </div>
  );
}