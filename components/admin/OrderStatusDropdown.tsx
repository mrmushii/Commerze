// components/admin/OrderStatusDropdown.tsx
'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IOrder } from '@/lib/type'; // Import IOrder to get enum types

interface OrderStatusDropdownProps {
  orderId: string;
  currentStatus: IOrder['orderStatus']; // Use the type from IOrder
}

const orderStatusOptions: IOrder['orderStatus'][] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * A client-side dropdown component to update an order's status.
 * Accessible only by admins.
 */
const OrderStatusDropdown: React.FC<OrderStatusDropdownProps> = ({ orderId, currentStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState<IOrder['orderStatus']>(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Handles the change of the dropdown selection.
   * Sends a PUT request to update the order status.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event.
   */
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as IOrder['orderStatus'];
    setSelectedStatus(newStatus);
    setLoading(true);
    toast.loading('Updating order status...', { id: `orderStatus-${orderId}` });

    try {
      await axios.put(`/api/orders/${orderId}`, { orderStatus: newStatus });
      toast.success('Order status updated!', { id: `orderStatus-${orderId}` });
      router.refresh(); // Refresh the parent Server Component page
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error('Error updating order status:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message || 'Failed to update status.', { id: `orderStatus-${orderId}` });
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to update status.', { id: `orderStatus-${orderId}` });
      } else {
        toast.error('Failed to update status. An unexpected error occurred.', { id: `orderStatus-${orderId}` });
      }
      setSelectedStatus(currentStatus); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={selectedStatus}
      onChange={handleChange}
      disabled={loading}
      className={`px-2 py-1 text-sm rounded-md border ${
        loading ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800 border-gray-300'
      } focus:ring-blue-500 focus:border-blue-500`}
    >
      {orderStatusOptions.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
};

export default OrderStatusDropdown;
