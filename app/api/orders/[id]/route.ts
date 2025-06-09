import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { IOrder, CustomSessionClaims } from '@/lib/type';
import mongoose from 'mongoose';

export async function GET(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Sign in required' },
      { status: 401 }
    );
  }

  try {
    let order: IOrder | null = null;

    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ stripeSessionId: id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const isAdmin = claims?.publicMetadata?.role === 'admin';
    if (order.userId !== userId && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have access to this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching order with ID ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch order: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.publicMetadata?.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    // Destructure to exclude userId and items if you want
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

export async function DELETE(req: Request, context: { params: { id: string } }) {
  await dbConnect();
  const { id } = context.params;
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
