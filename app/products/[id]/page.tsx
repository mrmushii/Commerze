'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { IProduct, IProductData } from '@/lib/type';
import AddToCartButton from '@/components/AddToCartButton';
import ImageWithFallback from '@/components/ImageWithFallback';
import mongoose from 'mongoose';
import axios from 'axios';
import Link from 'next/link';
import FeaturedProducts from '@/components/FeaturedProducts';
import ReviewSection from '@/components/ReviewSection';

interface ProductDetailPageProps {
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<IProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const handleRatingUpdated = (averageRating: number, reviewCount: number) => {
    if (product) {
      setProduct(prevProduct => prevProduct ? { ...prevProduct, averageRating, reviewCount } : null);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        setError('Invalid product ID.');
        setLoading(false);
        notFound();
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/products/${id}`);
        const data = response.data;

        if (response.status === 200 && data.success) {
          const fetchedProduct: IProductData = data.data;
          setProduct(fetchedProduct);
          setMainImage(fetchedProduct.imageUrls?.[0] || `https://placehold.co/400x400/F0F0F0/ADADAD?text=No+Image`);
          setSelectedColor(fetchedProduct.colors?.[0] || '');
          setSelectedSize(fetchedProduct.sizes?.[0] || '');
        } else {
          setError(data.message || 'Failed to fetch product details.');
          notFound();
        }
      } catch (err: unknown) {
        console.error('Error fetching product:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl text-gray-700">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center p-8 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Product Not Found or Error</h1>
        <p>Details could not be loaded. {error}</p>
        <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  const rating = product.averageRating || 0;
  const originalPrice = typeof product.price === 'number' && typeof product.discount === 'number'
    ? product.price / (1 - product.discount / 100)
    : product.price * 1.2;

  const displayDiscountPercentage = typeof product.discount === 'number' ? product.discount : Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const productImages = product.imageUrls;

  return (
    <div>
      <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg flex flex-col md:flex-row gap-8 mt-10">
        <div className="md:w-1/2 flex flex-col items-center">
          <div className="relative w-full h-96 mb-4 border rounded-lg overflow-hidden shadow-md">
            <ImageWithFallback
              src={mainImage || productImages[0] || `https://placehold.co/400x400/F0F0F0/ADADAD?text=No+Image`}
              alt={product.name}
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
              fallbackSrc={`https://placehold.co/400x400/F0F0F0/ADADAD?text=Image+Not+Found`}
            />
          </div>

          {productImages.length > 0 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    mainImage === img ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    objectFit="cover"
                    className="w-full h-full"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/F0F0F0/ADADAD?text=Img`; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:w-1/2 p-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center mb-4 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.203 9.091c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
            ))}
            <span className="text-gray-600 ml-2 text-sm">{rating.toFixed(1)}/5 ({product.reviewCount} reviews)</span>
          </div>

          <div className="mb-4">
            <span className="text-5xl font-bold text-red-600 mr-3">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
            {displayDiscountPercentage > 0 && (
              <>
                <span className="text-xl text-gray-500 line-through mr-2">${typeof originalPrice === 'number' ? originalPrice.toFixed(2) : originalPrice}</span>
                <span className="text-lg font-bold text-green-600">-{displayDiscountPercentage}%</span>
              </>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
          <p className="text-gray-700 leading-relaxed mb-2">Material: {product.material}</p>
          <p className="text-gray-700 leading-relaxed mb-6">Category: {product.category} - {product.type}</p>


          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Colors</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.toLowerCase() }}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === color ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm`}
                  title={color}
                >
                  {selectedColor === color && (
                      <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Size</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedSize === size ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {product.stock === 0 ? (
            <p className="text-red-600 font-semibold text-xl mb-6">Out of Stock</p>
          ) : (
            <AddToCartButton product={product} />
          )}
        </div>
      </div>

      <ReviewSection
        productId={product._id.toString()}
        onRatingUpdated={handleRatingUpdated}
      />

      <FeaturedProducts title="You Might Also Love" limit={4} />
    </div>
  );
}