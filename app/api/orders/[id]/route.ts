import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder, CustomSessionClaims } from '@/lib/type';
import mongoose from 'mongoose';

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = await context.params;
  const { userId, sessionClaims } = await auth();

  console.log(`API/orders/[id] GET request received for ID: ${id}`);
  console.log(`API/orders/[id] User ID from Clerk: ${userId}`);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Sign in required' }, { status: 401 });
  }

  try {
    let order: IOrder | null = null;
    console.log(`API/orders/[id] Attempting to find by ObjectId: ${id}`);
    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id);
    }

    if (!order) {
      console.log(`API/orders/[id] Not found by ObjectId. Attempting to find by stripeSessionId: ${id}`);
      order = await Order.findOne({ stripeSessionId: id });
    }

    if (!order) {
      console.error(`API/orders/[id] Order not found for any method with ID: ${id}`);
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    console.log(`API/orders/[id] Order found: ${order._id}`);

    const claims = sessionClaims as CustomSessionClaims;
    const isAdmin = claims?.metadata?.role === 'admin';
    if (order.userId !== userId && !isAdmin) {
      console.warn(`API/orders/[id] Forbidden access: Order userId ${order.userId} vs current userId ${userId}. Is Admin: ${isAdmin}`);
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have access to this order' }, { status: 403 });
    }

    console.log(`API/orders/[id] Successfully retrieved order: ${order._id}`);
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    console.error(`API/orders/[id] Error during order fetch for ID ${id}:`, error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
export async function PUT(req: Request, context: any) {
  await dbConnect();
  const { id } = await context.params;
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.publicMetadata?.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { userId: _bodyUserId, items: _bodyItems, ...updateData } = await req.json();

    const order: IOrder | null = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error updating order with ID ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update order: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request, context: any) {
  await dbConnect();
  const { id } = await context.params;
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.publicMetadata?.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const deletedOrder: IOrder | null = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error deleting order with ID ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to delete order: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
