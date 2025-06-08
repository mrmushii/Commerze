// components/admin/DeleteProductButton.tsx
'use client';

import React from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DeleteProductButtonProps {
  productId: string;
}

/**
 * A client-side button component for deleting a product.
 * It sends a DELETE request to the API and refreshes the product list.
 */
const DeleteProductButton: React.FC<DeleteProductButtonProps> = ({ productId }) => {
  const router = useRouter();

  /**
   * Handles the product deletion.
   * Prompts for confirmation before sending the DELETE request.
   */
  const handleDelete = async () => {
    // IMPORTANT: In a real app, use a custom modal for confirmation, NOT window.confirm()
    // For demonstration, window.confirm is used.
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    toast.loading('Deleting product...', { id: 'deleteProduct' });

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!', { id: 'deleteProduct' });
      router.refresh(); // Refresh the page to reflect the deletion
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error('Error deleting product:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message || 'Failed to delete product.', { id: 'deleteProduct' });
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete product.', { id: 'deleteProduct' });
      } else {
        toast.error('Failed to delete product. An unexpected error occurred.', { id: 'deleteProduct' });
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition duration-300 ease-in-out shadow-sm"
    >
      Delete
    </button>
  );
};

export default DeleteProductButton;
