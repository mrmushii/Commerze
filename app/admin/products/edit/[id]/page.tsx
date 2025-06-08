// app/admin/products/edit/[id]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct, CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims and IProduct
import ProductForm from '@/components/admin/ProductForm';
// Removed unused import: import mongoose from 'mongoose';


/**
 * Page for editing an existing product.
 * Fetches product data server-side and passes it to the ProductForm.
 * Requires admin authentication.
 */
export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth(); // Await auth()

  const claims = sessionClaims as CustomSessionClaims; // Type assertion

  // Redirect if not signed in or not an admin
  if (!userId || claims?.metadata?.role !== 'admin') {
    redirect('/sign-in');
  }

  await dbConnect(); // Connect to MongoDB
  const product: IProduct | null = await Product.findById(params.id); // Fetch product by ID

  if (!product) {
    notFound(); // Display 404 if product not found
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Edit Product: {product.name}</h1>
      {/* Pass the product data (serialized) to the client component */}
      <ProductForm initialData={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
