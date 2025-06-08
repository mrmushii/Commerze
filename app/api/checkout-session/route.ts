// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { CartItem } from '@/lib/type'; // Corrected import path for CartItem

// Initialize Stripe with your secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Using the API version from your local Stripe setup
  typescript: true, // Enable TypeScript support for Stripe
});

/**
 * Handles POST requests to create a Stripe Checkout Session.
 * @param {Request} req - The incoming request object containing cart items and user ID.
 * @returns {NextResponse} A JSON response with the Stripe Checkout Session URL or an error.
 */
export async function POST(req: Request) {
  await dbConnect(); // Ensure database connection

  try {
    const body = await req.json();
    const { cartItems, userId } = body; // Expect cartItems and userId from frontend

    // Basic validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid cart data or user ID provided.' },
        { status: 400 }
      );
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Iterate through cart items to prepare line_items for Stripe
    for (const item of cartItems as CartItem[]) {
      // Fetch product from DB to ensure accurate price and stock
      const product = await Product.findById(item.productId);

      if (!product) {
        console.error(`Product not found for ID: ${item.productId}`);
        return NextResponse.json(
          { success: false, message: `Product "${item.name}" not found.` },
          { status: 404 }
        );
      }

      // Check for sufficient stock before creating session
      if (product.stock < item.quantity) {
        console.error(`Insufficient stock for product: ${item.name}. Requested: ${item.quantity}, Available: ${product.stock}`);
        return NextResponse.json(
          { success: false, message: `Insufficient stock for "${product.name}". Only ${product.stock} available.` },
          { status: 400 }
        );
      }

      // Add product as a line item. Price must be in cents.
      line_items.push({
        price_data: {
          currency: 'usd', // Set your currency here (e.g., 'usd', 'eur')
          product_data: {
            name: product.name,
            images: [product.imageUrl], // Include product images
            description: product.description,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents and round
        },
        quantity: item.quantity,
      });
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Only 'card' for simplicity, can add others
      line_items: line_items,
      mode: 'payment', // For one-time payments
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      metadata: {
        userId: userId, // Pass Clerk's userId to Stripe for webhook access
        cart: JSON.stringify(cartItems), // Store serialized cart for webhook processing
      },
      // customer_email: user?.primaryEmailAddress?.emailAddress, // Optional: pre-fill email if available from Clerk user object
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) { // Changed 'any' to 'unknown'
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



