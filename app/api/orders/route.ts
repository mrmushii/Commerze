import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CustomSessionClaims } from '@/lib/type';

/**
 * Handles POST requests to create a new order.
 */
export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { userId, items, totalAmount, paymentStatus = 'pending', stripeSessionId } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data provided.' },
        { status: 400 }
      );
    }

    // Optional: Perform stock decrement logic
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for product: ${item.name}` },
          { status: 400 }
        );
      }
      // Uncomment this if you want to actually decrement stock now
      // await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const order: IOrder = await Order.create({
      userId,
      items,
      totalAmount,
      paymentStatus,
      stripeSessionId,
      orderStatus: 'pending',
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve orders.
 * Admins fetch all orders; regular users fetch only their own.
 */
export async function GET() {
  await dbConnect();
  const { userId, sessionClaims } = await auth();
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Sign in required' }, { status: 401 });
  }

  try {
    const isAdmin = claims?.metadata?.role === 'admin';
    const orders: IOrder[] = isAdmin
      ? await Order.find({})
      : await Order.find({ userId });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
