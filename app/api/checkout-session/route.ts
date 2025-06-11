// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import Order from '@/models/Order'; // Import Order model
import { CartItem, IOrder } from '@/lib/type'; // Import IOrder type
import mongoose from 'mongoose';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

/**
 * Handles POST requests to create a Stripe Checkout Session.
 * This route now also pre-creates a PENDING order in your database.
 *
 * @param {Request} req - The incoming request object containing cart items and user ID.
 * @returns {NextResponse} A JSON response with the Stripe Checkout Session URL or an error.
 */
export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { cartItems, userId } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !userId) {
      console.error('Checkout Session: Invalid cart data or user ID provided.');
      return NextResponse.json(
        { success: false, message: 'Invalid cart data or user ID provided.' },
        { status: 400 }
      );
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let calculatedTotalAmount = 0; // Calculate total on backend for integrity

    for (const item of cartItems as CartItem[]) {
      const product = await Product.findById(item.productId);

      if (!product) {
        console.error(`Checkout Session: Product not found for ID: ${item.productId}`);
        return NextResponse.json(
          { success: false, message: `Product "${item.name}" not found.` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        console.error(`Checkout Session: Insufficient stock for product: ${item.name}. Requested: ${item.quantity}, Available: ${product.stock}`);
        return NextResponse.json(
          { success: false, message: `Insufficient stock for "${product.name}". Only ${product.stock} available.` },
          { status: 400 }
        );
      }

      calculatedTotalAmount += product.price * item.quantity;

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.imageUrl],
            description: product.description,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    // Create the Stripe Checkout Session first
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      metadata: {
        userId: userId,
        cart: JSON.stringify(cartItems),
        // Important: Store a unique identifier to link this session to your internal order
        // This is usually done by creating the order *before* creating the session
        // and passing its _id to Stripe metadata.
      },
      // customer_email: user?.primaryEmailAddress?.emailAddress,
    });

    // NOW, pre-create a PENDING order in your database
    // This order will be updated by the /api/orders/confirm-payment route (and webhook as fallback)
    console.log('Checkout Session: Pre-creating PENDING order for session ID:', session.id);
    const newPendingOrder: IOrder = await Order.create({
      userId: userId,
      items: cartItems.map(item => ({ // Use cartItems directly from frontend for pending order
        productId: new mongoose.Types.ObjectId(item.productId), // Convert to ObjectId
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: calculatedTotalAmount, // Use backend calculated total
      paymentStatus: 'pending', // Mark as pending initially
      orderStatus: 'pending',
      stripeSessionId: session.id, // Link to Stripe Session ID
    });
    console.log('Checkout Session: PENDING order created with ID:', newPendingOrder._id.toString());


    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) {
    console.error('Stripe Checkout Session Creation Error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to create checkout session.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

