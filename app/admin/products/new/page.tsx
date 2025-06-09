// app/admin/products/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims

/**
 * Page for adding a new product to the e-commerce store.
 * Requires admin authentication.
 */
export default async function NewProductPage() {
  const { userId, sessionClaims } = await auth(); // Await auth()

  interface CustomSessionClaims {
  public_metadata?: {
    role?: string;
  };
}

const claims = sessionClaims as CustomSessionClaims;

if (!userId || claims?.public_metadata?.role !== 'admin') {
  redirect('/sign-in');
}

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
