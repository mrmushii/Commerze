import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Products";
import { IProduct, CustomSessionClaims } from "@/lib/type";
import mongoose from "mongoose";
import ImageWithFallback from "@/components/ImageWithFallback";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.public_metadata?.role !== "admin") {
    redirect("/sign-in");
  }

  await dbConnect();
  const products: IProduct[] = await Product.find({});

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Product Management
        </h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md text-center sm:text-left hover:bg-green-700 transition duration-300 ease-in-out shadow-md w-full sm:w-auto"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-8">
          No products found. Add your first product!
        </p>
      ) : (
        <div>
          <div className="hidden sm:block w-full overflow-x-auto">
            <div className="min-w-[750px]">
              <table className="w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>
                    <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={(product._id as mongoose.Types.ObjectId).toString()}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                    >
                      <td className="py-3 px-4 border-b">
                        <ImageWithFallback
                          src={
                            product.imageUrls?.[0] ||
                            `https://placehold.co/60x60/F0F0F0/ADADAD?text=No+Image`
                          }
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                          fallbackSrc={`https://placehold.co/60x60/F0F0F0/ADADAD?text=Img`}
                        />
                      </td>
                      <td className="py-3 px-4 border-b text-gray-800 font-medium">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-800">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-800">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                          <Link
                            href={`/admin/products/edit/${(
                              product._id as mongoose.Types.ObjectId
                            ).toString()}`}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton
                            productId={(
                              product._id as mongoose.Types.ObjectId
                            ).toString()}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="block sm:hidden space-y-4">
            {products.map((product) => (
              <div
                key={(product._id as mongoose.Types.ObjectId).toString()}
                className="border rounded-lg shadow-sm p-4 flex flex-col gap-2 bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={
                      product.imageUrls?.[0] ||
                      `https://placehold.co/60x60/F0F0F0/ADADAD?text=No+Image`
                    }
                    alt={product.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                    fallbackSrc={`https://placehold.co/60x60/F0F0F0/ADADAD?text=Img`}
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-gray-700 text-sm flex justify-between">
                  <span>Price: ${product.price.toFixed(2)}</span>
                  <span>Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/admin/products/edit/${(
                      product._id as mongoose.Types.ObjectId
                    ).toString()}`}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white text-center rounded-md text-sm hover:bg-blue-600 transition"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton
                    productId={(
                      product._id as mongoose.Types.ObjectId
                    ).toString()}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
