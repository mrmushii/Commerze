import Image from 'next/image';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';
import AddToCartButton from '@/components/AddToCartButton'; // We'll create this soon

/**
 * Generates static paths for products during build time.
 * This is useful for static site generation (SSG) if you know your product IDs in advance.
 * For dynamic content, you might not use this or use a different strategy.
 */
export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({}, { _id: 1 }); // Fetch only IDs
  return products.map(product => ({
    id: product._id.toString(),
  }));
}

/**
 * Renders the product detail page for a specific product ID.
 * @param {object} props - Contains route parameters (e.g., params.id).
 */
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  await dbConnect(); // Connect to MongoDB
  const product: IProduct | null = await Product.findById(params.id); // Fetch product by ID

  // If product not found, display 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0 w-full md:w-1/2 relative h-80 md:h-auto">
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/600x400/F0F0F0/ADADAD?text=Image+Not+Found`;
            }}
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

          {/* Add to Cart Button (Client Component) */}
          <AddToCartButton product={JSON.parse(JSON.stringify(product))} />
        </div>
      </div>
    </div>
  );
}
