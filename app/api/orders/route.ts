import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { auth } from '@clerk/nextjs/server';
import { CustomSessionClaims, IOrder } from '@/lib/type';

/**
 * Handles GET request to fetch a single order by ID.
 * Admins can access any order; users can access their own orders.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Sign in required' },
      { status: 401 }
    );
  }

  try {
    const order: IOrder | null = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const isAdmin = claims?.metadata?.role === 'admin';
    const isOwner = order.userId === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You cannot access this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching order:', error);
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

/**
 * Handles DELETE request to delete an order by ID.
 * Only admins are allowed to perform this action.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId || claims?.metadata?.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admins only' },
      { status: 403 }
    );
  }

  try {
    const deletedOrder = await Order.findByIdAndDelete(params.id);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting order:', error);
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
