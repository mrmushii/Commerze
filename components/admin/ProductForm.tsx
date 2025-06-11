// components/admin/ProductForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IProduct } from '@/lib/type'; // Corrected import path for IProduct interface
import mongoose from 'mongoose';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

// Define the Zod schema for product validation
const productFormSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  price: z.coerce.number().min(0, { message: 'Price must be a non-negative number.' }),
  // FIX: imageUrls validation adjusted to accept both valid URLs and relative /uploads paths
  imageUrls: z.array(z.string().refine(url => {
    try {
      new URL(url); // Try to parse as absolute URL
      return true;
    } catch {
      // If it's not a valid absolute URL, check if it's a valid relative /uploads path
      return url.startsWith('/uploads/') && url.length > '/uploads/'.length;
    }
  }, { message: 'Each image must be a valid URL or a valid /uploads path.' })).min(1, { message: 'At least one image is required.' }),
  category: z.string().min(1, { message: 'Primary category is required.' }),
  type: z.enum(['Formal', 'Casual', 'Party', 'Sportswear', 'Other'], { message: 'Invalid clothing type selected.' }),
  sizes: z.array(z.string()).min(1, { message: 'At least one size must be selected.' }),
  colors: z.array(z.string()).min(1, { message: 'At least one color must be selected.' }),
  material: z.string().min(1, { message: 'Material is required.' }),
  gender: z.enum(['Men', 'Women', 'Kids', 'Unisex'], { message: 'Invalid gender selected.' }),
  stock: z.coerce.number().min(0, { message: 'Stock must be a non-negative number.' }),
});

// Infer the form values type from the schema
type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Omit<IProduct, 'createdAt' | 'updatedAt'> | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();

  const clothingTypes = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const defaultColors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Brown', 'Purple', 'Pink'];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrls: [],
      category: '',
      type: 'Other',
      sizes: [],
      colors: [],
      material: '',
      gender: 'Unisex',
      stock: 0,
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, isValid } } = form;

  const [filePreviews, setFilePreviews] = useState<{ file: File, preview: string }[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const debugImageUrls = watch('imageUrls');

  // --- NEW DEBUGGING LOGS ---
  useEffect(() => {
    console.log('RHF imageUrls state (watch):', debugImageUrls);
    console.log('RHF errors object (on render):', errors);
    console.log('RHF form isValid (on render):', isValid);
  }, [debugImageUrls, errors, isValid]);
  // --- END NEW DEBUGGING LOGS ---


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
    onDrop: (acceptedFiles) => {
      const newFilePreviews = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setFilePreviews(prev => [...prev, ...newFilePreviews.map(file => ({ file, preview: file.preview }))]);
      
      uploadFiles(acceptedFiles);
    },
    noClick: false,
  });

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    toast.loading('Uploading images...', { id: 'image-upload' });

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newUrls: string[] = response.data.urls;
        const currentFormImageUrls = form.getValues('imageUrls') || [];
        // Ensure that any 'blob:' URLs from previews are replaced by the real URLs if they correspond
        const finalUrls = [...currentFormImageUrls.filter(url => !url.startsWith('blob:')), ...newUrls];

        setValue('imageUrls', finalUrls, { shouldValidate: true, shouldDirty: true });
        setExistingImageUrls(finalUrls); // Update local state for display
        setFilePreviews([]);
        toast.success('Images uploaded successfully!', { id: 'image-upload' });
      } else {
        toast.error(response.data.message || 'Image upload failed.', { id: 'image-upload' });
        setFilePreviews([]);
        // Clean up any blob URLs in RHF state if upload failed
        setValue('imageUrls', form.getValues('imageUrls').filter(url => !url.startsWith('blob:')), { shouldValidate: true });
      }
    } catch (error: unknown) {
      console.error('Image upload error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message || 'Image upload failed.', { id: 'image-upload' });
      } else {
        toast.error('An unexpected error occurred during image upload.', { id: 'image-upload' });
      }
      setFilePreviews([]);
      setValue('imageUrls', form.getValues('imageUrls').filter(url => !url.startsWith('blob:')), { shouldValidate: true });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (urlToRemove: string, isPreview: boolean) => {
    if (isPreview) {
      setFilePreviews(prev => {
        const updatedPreviews = prev.filter(f => f.preview !== urlToRemove);
        URL.revokeObjectURL(urlToRemove); // Clean up the blob URL
        return updatedPreviews;
      });
    } else {
      setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
      const currentFormImageUrls = form.getValues('imageUrls') || [];
      setValue('imageUrls', currentFormImageUrls.filter(url => url !== urlToRemove), { shouldValidate: true, shouldDirty: true });
    }
  };


  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        imageUrls: initialData.imageUrls || [],
        category: initialData.category,
        type: initialData.type,
        sizes: initialData.sizes || [],
        colors: initialData.colors || [],
        material: initialData.material,
        gender: initialData.gender,
        stock: initialData.stock,
      });
      setExistingImageUrls(initialData.imageUrls || []);
    }
  }, [initialData, reset, setValue]);

  useEffect(() => {
    return () => filePreviews.forEach(file => URL.revokeObjectURL(file.preview));
  }, [filePreviews]);


  const onSubmit = async (data: ProductFormValues) => {
    console.log('Form submitted! (onSubmit called)');
    console.log('Data passed to onSubmit:', data);
    console.log('Errors object at onSubmit (should be empty):', errors);
    console.log('isValid at onSubmit (should be true):', isValid);

    toast.dismiss();

    if (uploadingImages) {
        toast.error('Please wait for images to finish uploading.');
        return;
    }
    
    if (!isValid) {
        toast.error('Please correct the validation errors in the form.');
        console.error('Form is invalid. Errors:', errors);
        return;
    }

    if (data.imageUrls.length === 0) {
      toast.error('At least one image is required for the product.');
      console.error('Submission aborted: imageUrls array is empty.');
      return;
    }


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
    } finally {
      // isSubmitting is managed by react-hook-form, so no manual setLoading(false) needed here
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
      
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price ($)
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          {...register('price')} // Zod handles coercion
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
      </div>

      {/* Image Upload using React Dropzone */}
      <div className="border border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors" {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the images here ...</p>
        ) : (
          <p className="text-gray-600">Drag & drop product images here, or click to select files</p>
        )}
        <p className="text-sm text-gray-500 mt-2">Accepted: JPG, PNG, GIF (min 1 image)</p>
      </div>
      {uploadingImages && (
        <div className="text-center text-blue-600 text-sm">Uploading...</div>
      )}
      {errors.imageUrls && <p className="mt-1 text-sm text-red-600">{errors.imageUrls.message}</p>}

      {/* Image Previews & Management */}
      {(filePreviews.length > 0 || existingImageUrls.length > 0) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing images from initialData or previous uploads */}
          {existingImageUrls.map((url, index) => (
            <div key={url} className="relative w-full h-24 border rounded-md overflow-hidden group">
              <Image src={url} alt={`Product image ${index}`} fill style={{objectFit:"cover"}} className="rounded-md" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              <button
                type="button"
                onClick={() => removeImage(url, false)} // isPreview: false
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
          {/* New file previews (before actual upload) */}
          {filePreviews.map((fileWrapper, index) => (
            <div key={fileWrapper.preview} className="relative w-full h-24 border rounded-md overflow-hidden group border-blue-500">
              <Image src={fileWrapper.preview} alt={`New image preview ${index}`} fill style={{objectFit:"cover"}} className="rounded-md" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">Pending Upload</div>
              <button
                type="button"
                onClick={() => removeImage(fileWrapper.preview, true)} // isPreview: true
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Remove preview"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Primary Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Primary Category (e.g., Men, Women, Kids)
        </label>
        <input
          type="text"
          id="category"
          {...register('category')} // Register input with react-hook-form
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      {/* Clothing Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
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

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultSizes.map(size => (
            <label key={size} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={size}
                {...register('sizes')}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{size}</span>
            </label>
          ))}
        </div>
        {errors.sizes && <p className="mt-1 text-sm text-red-600">{errors.sizes.message}</p>}
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultColors.map(color => (
            <label key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={color}
                {...register('colors')}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{color}</span>
            </label>
          ))}
        </div>
        {errors.colors && <p className="mt-1 text-sm text-red-600">{errors.colors.message}</p>}
      </div>

      {/* Material */}
      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
          Material
        </label>
        <input
          type="text"
          id="material"
          {...register('material')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material.message}</p>}
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
          Gender
        </label>
        <select
          id="gender"
          {...register('gender')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {genders.map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
      </div>

      {/* Stock Quantity */}
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity
        </label>
        <input
          type="number"
          id="stock"
          min="0"
          {...register('stock')} // Zod handles coercion
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || uploadingImages}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          (isSubmitting || uploadingImages) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? 'Saving...' : uploadingImages ? 'Uploading Images...' : (initialData ? 'Update Product' : 'Add Product')}
      </button>
    </form>
  );
};

export default ProductForm;