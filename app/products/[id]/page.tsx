import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';
import AddToCartButton from '@/components/AddToCartButton';
import mongoose from 'mongoose';
import ImageWithFallback from '@/components/ImageWithFallback'; // Import the new client component

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await  params;

  if (!id) {
    notFound();
  }

  await dbConnect();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const productDoc = await Product.findById(id).lean();

  if (!productDoc) {
    notFound();
  }

  const product = JSON.parse(JSON.stringify(productDoc)) as IProduct;

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0 w-full md:w-1/2 relative h-80 md:h-auto">
          {/* Using the new ImageWithFallback client component */}
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
            fallbackSrc={`https://placehold.co/600x400/F0F0F0/ADADAD?text=Image+Not+Found`}
          />
        </div>
        <div className="p-8 md:w-1/2">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-xl text-gray-700 mb-4">{product.category}</p>
          <p className="text-4xl font-bold text-blue-700 mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-800 leading-relaxed mb-6">{product.description}</p>

          <div className="mb-6">
            {product.stock === 0 ? (
              <span className="text-red-600 font-semibold text-lg">Out of Stock</span>
            ) : (
              <span className="text-green-700 font-semibold text-lg">In Stock: {product.stock} units</span>
            )}
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
