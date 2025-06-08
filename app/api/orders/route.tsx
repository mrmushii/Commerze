import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Import auth
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CartItem } from '@/lib/type'; // Import types

/**
 * Define a custom type for Clerk's sessionClaims to ensure 'metadata' and 'role' are recognized.
 * This extends the default SessionClaims type from Clerk to include our custom publicMetadata.
 */
interface CustomSessionClaims {
  metadata?: {
    role?: string; // Make role optional as it might not always be present
  };
}

/**
 * Handles POST requests to create a new order.
 * This API is primarily intended to be called by a webhook (e.g., Stripe webhook)
 * or by an authenticated client after a successful payment.
 *
 * @param {Request} req - The incoming request object containing order data.
 * @returns {NextResponse} A JSON response with the created order or an error message.
 */
export async function POST(req: Request) {
  await dbConnect(); // Ensure database connection is established

  try {
    const body = await req.json();
    const { userId, items, totalAmount, paymentStatus = 'pending', stripeSessionId } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return NextResponse.json(
        { success: false, message: 'Invalid order data provided.' },
        { status: 400 }
      );
    }

    // Optional: Perform stock decrement here if not already handled by webhook
    // This logic is mostly for synchronous order creation, but for e-commerce,
    // webhooks are preferred for reliability after async payment.
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for product: ${item.name}` },
          { status: 400 }
        );
      }
      // Decrement stock (if not using webhook for this)
      // await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    // Create a new order document
    const order: IOrder = await Order.create({
      userId,
      items,
      totalAmount,
      paymentStatus,
      stripeSessionId,
      orderStatus: 'pending', // Initial status
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
  const { userId, sessionClaims } = await auth(); // Await auth()

  // Explicitly cast sessionClaims to our custom type for better type inference
  const claims = sessionClaims as CustomSessionClaims;

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Sign in required' }, { status: 401 });
  }

  try {
    let orders: IOrder[];
    // Check for userId, then safely access role using optional chaining
    const isAdmin = claims?.metadata?.role === 'admin';

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
