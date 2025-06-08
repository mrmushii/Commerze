import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CartItem } from '@/lib/type';

/**
 * Handles POST requests to create a new order.
 * Primarily used by webhooks (e.g., Stripe) after payment confirmation.
 * Requires internal handling (e.g., webhook secret check) for external calls.
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

    // In a production app, for POST, you'd add internal authentication or rely on webhook secret.
    // For now, this is a basic creation.

    const order: IOrder = await Order.create({
      userId,
      items,
      totalAmount,
      paymentStatus,
      stripeSessionId,
      orderStatus: 'pending',
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to retrieve orders.
 * Admins fetch all orders; regular users fetch only their own.
 */
export async function GET(req: Request) {
  await dbConnect();
  const { userId, sessionClaims } = auth();

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Sign in required' }, { status: 401 });
  }

  try {
    let orders: IOrder[];
    const isAdmin = sessionClaims?.metadata?.role === 'admin';

    if (isAdmin) {
      orders = await Order.find({}); // Fetch all orders for admin
    } else {
      orders = await Order.find({ userId: userId }); // Fetch only user's orders
    }

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
}
