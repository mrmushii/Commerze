// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder, CustomSessionClaims } from '@/lib/type'; // Import CustomSessionClaims
import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId

/**
 * Handles GET requests to retrieve a single order by ID.
 * Admins can retrieve any order; regular users can only retrieve their own orders.
 *
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response with the order data or an error.
 */
export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
  const { userId, sessionClaims } = await auth(); // Get auth info

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Sign in required' }, { status: 401 });
  }

  try {
    let order: IOrder | null = null;

    // Try to find by MongoDB ObjectId first, then by stripeSessionId if not found
    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id);
    }
    // If not found by ObjectId or if the ID is not a valid ObjectId, try finding by stripeSessionId
    if (!order) {
      order = await Order.findOne({ stripeSessionId: id });
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Check if the current user is the owner of the order OR is an admin
    const isAdmin = claims?.metadata?.role === 'admin';
    if (order.userId !== userId && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have access to this order' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error(`Error fetching order with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an existing order by ID.
 * Only accessible by admins.
 *
 * @param {Request} req - The incoming request object with updated order data.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response with the updated order or an error.
 */
export async function PUT(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
  const { userId, sessionClaims } = await auth();

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  // Only allow admins to update orders
  if (!userId || claims?.metadata?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    // Adjusted destructuring to avoid unused variable linting errors
    const { userId: _bodyUserId, items: _bodyItems, ...updateData } = await req.json(); // Safely destructure and ignore if not needed
    // You can now use bodyUserId and bodyItems if you need them for other logic, or simply omit if not.
    // If not used, ESLint will still complain unless you explicitly ignore them,
    // but the original intent was to exclude them from `updateData`.

    const order: IOrder | null = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error(`Error updating order with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to update order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 400 }
    );
  }
}

/**
 * Handles DELETE requests to delete an order by ID.
 * Only accessible by admins.
 *
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains dynamic route parameters (e.g., params.id).
 * @returns {NextResponse} A JSON response indicating success or an error.
 */
export async function DELETE(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
  const { userId, sessionClaims } = await auth();

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  // Only allow admins to delete orders
  if (!userId || claims?.metadata?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const deletedOrder: IOrder | null = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error(`Error deleting order with ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to delete order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
