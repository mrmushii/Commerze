import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct, CustomSessionClaims } from '@/lib/type';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.public_metadata?.role !== 'admin') {
    redirect('/sign-in');
  }

  const { id } = params;

  await dbConnect();
  const product: IProduct | null = await Product.findById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Edit Product: {product.name}</h1>
      <ProductForm initialData={JSON.parse(JSON.stringify(product))} />
    </div>
  );
}
