'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IProduct } from '@/lib/type'; // Import IProduct interface
import mongoose from 'mongoose'; // Import mongoose for ObjectId type

// React Hook Form and Zod imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the Zod schema for product validation
const productFormSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  price: z.preprocess(
    (val) => parseFloat(z.string().parse(val)),
    z.number().min(0, { message: 'Price must be a positive number.' })
  ),
  imageUrl: z.string().url({ message: 'Must be a valid URL for the image.' }),
  category: z.string().min(1, { message: 'Primary category is required.' }),
  type: z.enum(['Formal', 'Casual', 'Party', 'Sportswear', 'Other'], { message: 'Invalid clothing type selected.' }),
  sizes: z.array(z.string()).min(1, { message: 'At least one size must be selected.' }),
  colors: z.array(z.string()).min(1, { message: 'At least one color must be selected.' }),
  material: z.string().min(1, { message: 'Material is required.' }),
  gender: z.enum(['Men', 'Women', 'Kids', 'Unisex'], { message: 'Invalid gender selected.' }),
  stock: z.preprocess(
    (val) => parseInt(z.string().parse(val), 10),
    z.number().min(0, { message: 'Stock must be a non-negative number.' })
  ),
});

// Infer the form values type from the schema
type ProductFormValues = z.infer<typeof productFormSchema>;

// Define props for the ProductForm component
interface ProductFormProps {
  initialData?: Omit<IProduct, 'createdAt' | 'updatedAt'> | null; // Optional: for editing existing products
}

/**
 * A reusable form component for adding or editing product details.
 * It's a Client Component using react-hook-form for efficient form management.
 */
const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();

  // Define clothing-specific options (can be fetched from API if dynamic)
  const clothingTypes = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const defaultColors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Brown', 'Purple', 'Pink'];

  // Initialize react-hook-form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      type: 'Other', // Default value from enum
      sizes: [],
      colors: [],
      material: '',
      gender: 'Unisex', // Default value from enum
      stock: 0,
    },
  });

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = form;


  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price, // Price is number in IProduct, matches schema type
        imageUrl: initialData.imageUrl,
        category: initialData.category,
        type: initialData.type,
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        material: initialData.material,
        gender: initialData.gender,
        stock: initialData.stock, // Stock is number in IProduct, matches schema type
      });
    }
  }, [initialData, reset]);

  /**
   * Handles form submission for adding or updating a product.
   * This function is called by react-hook-form's handleSubmit only if validation passes.
   */
  const onSubmit = async (data: ProductFormValues) => {
    toast.dismiss(); // Clear any previous toasts

    try {
      let response;
      if (initialData) {
        response = await axios.put(`/api/products/${(initialData._id as mongoose.Types.ObjectId).toString()}`, data);
        toast.success('Product updated successfully!');
      } else {
        response = await axios.post('/api/products', data);
        toast.success('Product created successfully!');
      }

      console.log('API Response:', response.data);
      router.push('/admin/products');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message || 'Failed to save product. Please check your inputs.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save product. Please check your inputs.');
      } else {
        toast.error('Failed to save product. An unexpected error occurred.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')} // Register input with react-hook-form
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')} // Register textarea
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price ($)
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          {...register('price', { valueAsNumber: true })} // Register as number
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          {...register('imageUrl')} // Register as URL
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Primary Category (e.g., Men, Women, Kids)
        </label>
        <input
          type="text"
          id="category"
          {...register('category')} // Register input
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      {/* New Fields for Clothing */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Clothing Type (e.g., Formal, Casual)
        </label>
        <select
          id="type"
          {...register('type')} // Register select
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {clothingTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultSizes.map(size => (
            <label key={size} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={size}
                {...register('sizes')} // Register checkbox with same name
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{size}</span>
            </label>
          ))}
        </div>
        {errors.sizes && <p className="mt-1 text-sm text-red-600">{errors.sizes.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultColors.map(color => (
            <label key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={color}
                {...register('colors')} // Register checkbox with same name
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{color}</span>
            </label>
          ))}
        </div>
        {errors.colors && <p className="mt-1 text-sm text-red-600">{errors.colors.message}</p>}
      </div>

      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700">
          Material
        </label>
        <input
          type="text"
          id="material"
          {...register('material')} // Register input
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>}
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          id="gender"
          {...register('gender')} // Register select
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {genders.map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
      </div>
      {/* End New Fields */}

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stock Quantity
        </label>
        <input
          type="number"
          id="stock"
          min="0"
          {...register('stock', { valueAsNumber: true })} // Register as number
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting} // Use isSubmitting from react-hook-form
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;