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
    let order: IOrder | null = null;

    // Try to find by MongoDB _id if it's a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    if (isValidObjectId) {
      order = await Order.findById(params.id);
    }

    // If not found by _id, try finding by stripeSessionId
    if (!order) {
      order = await Order.findOne({ stripeSessionId: params.id });
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const isAdmin = claims?.publicMetadata?.role === 'admin';
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

  if (!userId || claims?.publicMetadata?.role !== 'admin') {
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
