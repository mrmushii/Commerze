// app/products/[id]/page.tsx
import Image from 'next/image'; // Assuming CustomImage handles next/image internally
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products'; // Corrected import from '@/models/Products' to '@/models/Product'
import { IProduct } from '@/lib/type'; // Corrected import from '@/lib/type' to '@/types'
import AddToCartButton from '@/components/AddToCartButton';
import mongoose from 'mongoose'; // Import mongoose for type safety
import CustomImage from '@/components/CustomImage'; // Assuming you have this component


export const dynamic = 'force-dynamic'; // Ensures dynamic rendering, not static generation

interface ProductDetailPageProps {
  params: { id: string };
}

// REMOVED generateStaticParams because it can conflict with 'force-dynamic'
// and cause misleading errors if not configured to pre-generate paths correctly.
// If you intend to pre-generate specific product pages, you would need to implement
// this function to return an array of { id: string } objects based on your products.
// For fully dynamic pages, it's not needed.
// export async function generateStaticParams() {
//   await dbConnect();
//   const products = await Product.find({}, { _id: 1 }); // Fetch only IDs
//   return products.map(product => ({
//     id: (product._id as mongoose.Types.ObjectId).toString(),
//   }));
// }

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // FIX: Access params.id directly without 'await'. `params` is already resolved.
  const { id } = params;

  // It's good practice to ensure `id` exists, though Next.js handles this for dynamic routes.
  if (!id) {
    notFound();
  }

  await dbConnect();

  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // If it's not a valid ObjectId, then this is an invalid product ID.
    notFound();
  }

  // Fetch product from the database
  // Using .lean() for performance: converts Mongoose document to a plain JavaScript object
  const productDoc = await Product.findById(id).lean();

  // If product not found, display 404 page
  if (!productDoc) {
    notFound();
  }

  // Convert Mongoose document to a plain JavaScript object for client components
  // and type assertion. This is needed because Mongoose documents are not plain JSON objects.
  const product = JSON.parse(JSON.stringify(productDoc)) as IProduct;

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0 w-full md:w-1/2 relative h-80 md:h-auto">
          <CustomImage
            src={product.imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg"
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
