// components/admin/ProductForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { IProduct } from '@/lib/type'; // Import IProduct interface
import mongoose from 'mongoose'; // Import mongoose for ObjectId type

// Define props for the ProductForm component
interface ProductFormProps {
  initialData?: Omit<IProduct, 'createdAt' | 'updatedAt'> | null; // Optional: for editing existing products
}

/**
 * A reusable form component for adding or editing product details.
 * It's a Client Component to handle form state and API submissions.
 */
const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter(); // Next.js router for navigation

  // Define clothing-specific options
  const clothingTypes = ['Formal', 'Casual', 'Party', 'Sportswear', 'Other'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const defaultColors = ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Gray', 'Brown', 'Purple', 'Pink'];

  // State to manage form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '', // Primary category (Men, Women, Kids)
    type: clothingTypes[0], // Secondary category (Formal, Casual, etc.)
    sizes: [] as string[], // Array of selected sizes
    colors: [] as string[], // Array of selected colors
    material: '',
    gender: genders[0],
    stock: '',
  });
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(), // Convert number to string for input
        imageUrl: initialData.imageUrl,
        category: initialData.category,
        type: initialData.type,
        sizes: initialData.sizes || [], // Ensure it's an array
        colors: initialData.colors || [], // Ensure it's an array
        material: initialData.material,
        gender: initialData.gender,
        stock: initialData.stock.toString(), // Convert number to string for input
      });
    }
  }, [initialData]);

  /**
   * Handles changes to text/number/select input fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handles changes for multi-select (sizes/colors) checkboxes.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prevData) => {
      const currentArray = prevData[name as 'sizes' | 'colors'] as string[];
      if (checked) {
        return {
          ...prevData,
          [name]: [...currentArray, value],
        };
      } else {
        return {
          ...prevData,
          [name]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };


  /**
   * Handles form submission for adding or updating a product.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clear any previous toasts

    // Basic validation for arrays
    if (formData.sizes.length === 0) {
      toast.error('Please select at least one size.');
      setLoading(false);
      return;
    }
    if (formData.colors.length === 0) {
      toast.error('Please select at least one color.');
      setLoading(false);
      return;
    }

    try {
      // Prepare data, converting price and stock to numbers
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      let response;
      if (initialData) {
        // Update existing product if initialData is provided
        response = await axios.put(`/api/products/${(initialData._id as mongoose.Types.ObjectId).toString()}`, dataToSend); // Cast _id to string
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        response = await axios.post('/api/products', dataToSend);
        toast.success('Product created successfully!');
      }

      console.log('API Response:', response.data);
      router.push('/admin/products'); // Redirect to product list after success
      router.refresh(); // Refresh the page to show latest data
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error('Error saving product:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message || 'Failed to save product. Please check your inputs.');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save product. Please check your inputs.');
      } else {
        toast.error('Failed to save product. An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price ($)
        </label>
        <input
          type="number"
          name="price"
          id="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url" // Use type="url" for URL validation
          name="imageUrl"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Primary Category (e.g., Men, Women, Kids)
        </label>
        <input
          type="text"
          name="category"
          id="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* New Fields for Clothing */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Clothing Type (e.g., Formal, Casual)
        </label>
        <select
          name="type"
          id="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {clothingTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultSizes.map(size => (
            <label key={size} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="sizes"
                value={size}
                checked={formData.sizes.includes(size)}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
        <div className="grid grid-cols-3 gap-2">
          {defaultColors.map(color => (
            <label key={color} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="colors"
                value={color}
                checked={formData.colors.includes(color)}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-gray-700">{color}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700">
          Material
        </label>
        <input
          type="text"
          name="material"
          id="material"
          value={formData.material}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          name="gender"
          id="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {genders.map(gender => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>
      </div>
      {/* End New Fields */}

      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stock Quantity
        </label>
        <input
          type="number"
          name="stock"
          id="stock"
          value={formData.stock}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {loading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;
