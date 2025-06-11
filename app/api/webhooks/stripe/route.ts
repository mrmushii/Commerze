// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
// Removed 'buffer' from 'micro' as req.text() is preferred for Web Request objects in App Router
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order'; // Corrected import path for Order
import Product from '@/models/Products'; // Corrected import path for Product
import { IOrder, CartItem } from '@/lib/type'; // Corrected import path for IOrder and CartItem
import mongoose from 'mongoose';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Set to the version causing the TypeScript error
  typescript: true,
});

// Disable body parsing for this route as we need the raw body for Stripe signature verification
// Note: In Next.js App Router, this 'config' export might not be directly honored for route handlers.
// The primary way to handle raw body is `await req.text()`.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Handles Stripe webhook events.
 * This function is responsible for verifying the webhook signature and processing events
 * like `checkout.session.completed` to update your database.
 *
 * @param {Request} req - The incoming request object (containing the raw body for webhook verification).
 * @returns {NextResponse} A JSON response indicating success or an error.
 */
export async function POST(req: Request) {
  // Get the raw body for signature verification using req.text() for Web Request objects
  const rawBody = await req.text();
  // Await headers() before calling .get()
  const signature = (await headers()).get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Your Stripe webhook signing secret

  let event: Stripe.Event;

  console.log('--- Webhook Start ---');
  console.log('Webhook Request Headers:', (await headers()).entries());
  console.log('Webhook Raw Body Length:', rawBody.length);
  console.log('Webhook Signature:', signature);
  console.log('Webhook Secret (from .env):', webhookSecret ? '******' : 'MISSING!'); // Mask secret

  try {
    if (!signature || !webhookSecret) {
      console.error('Webhook: Signature or Secret missing.');
      return NextResponse.json({ success: false, message: 'Webhook secret or signature missing.' }, { status: 400 });
    }
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('Webhook: Signature verification SUCCESS.');
  } catch (err: unknown) { // Changed 'any' to 'unknown'
    console.error(`Webhook: Signature verification FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`);
    console.log('Webhook: Full error object:', err); // Log full error for more details
    return NextResponse.json({ success: false, message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 400 });
  }

  await dbConnect(); // Ensure database connection
  console.log('Webhook: Database Connected.');

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Webhook: Processing checkout.session.completed event.');
        console.log('Webhook: Stripe Session ID:', session.id); // Log the session ID from webhook
        console.log('Webhook: Stripe Metadata:', session.metadata); // Log all metadata

        // Extract relevant data from session metadata
        const userId = session.metadata?.userId;
        let cart: CartItem[] = [];
        try {
            cart = JSON.parse(session.metadata?.cart || '[]') as CartItem[];
        } catch (parseError) {
            console.error('Webhook: Failed to parse cart metadata:', parseError);
            return NextResponse.json({ received: true, message: 'Invalid cart metadata.' }, { status: 400 });
        }

        const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to dollars

        console.log('Webhook: Parsed userId:', userId);
        console.log('Webhook: Parsed cart (first item):', cart.length > 0 ? cart[0] : 'empty');
        console.log('Webhook: Calculated totalAmount:', totalAmount);


        if (!userId || cart.length === 0 || totalAmount === 0) {
          console.error('Webhook: Missing data in checkout.session.completed metadata (userId, cart, or totalAmount).');
          return NextResponse.json({ received: true, message: 'Missing metadata.' }, { status: 400 }); // Return 400 to Stripe
        }

        // 1. Create a new Order in your database
        // First, check if an order with this stripeSessionId already exists to prevent duplicates
        console.log('Webhook: Checking for existing order with stripeSessionId:', session.id);
        const existingOrder = await Order.findOne({ stripeSessionId: session.id });
        if (existingOrder) {
          console.warn(`Webhook: Order with Stripe Session ID ${session.id} already exists. Skipping creation.`);
          return NextResponse.json({ received: true, message: 'Order already exists.' }, { status: 200 });
        }

        console.log('Webhook: Attempting to create new order...');
        try {
            const newOrder: IOrder = await Order.create({
                userId: userId,
                items: cart,
                totalAmount: totalAmount,
                paymentStatus: 'paid', // Mark as paid
                orderStatus: 'pending', // Initial order fulfillment status
                stripeSessionId: session.id, // Ensure this is correctly set
            });
            console.log('Webhook: New Order Created in DB with ID:', newOrder._id.toString());
            console.log('Webhook: New Order stripeSessionId saved as:', newOrder.stripeSessionId);

            // 2. Decrement product stock based on `cart`
            console.log('Webhook: Attempting to decrement product stock...');
            for (const item of cart) {
                const product = await Product.findById(item.productId);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await Product.findByIdAndUpdate(item.productId, { stock: newStock });
                    console.log(`Webhook: Updated stock for product ${item.name}: ${product.stock} -> ${newStock}`);
                } else {
                    console.warn(`Webhook: Product with ID ${item.productId} not found for stock decrement.`);
                }
            }
            console.log('Webhook: Stock decrement process complete.');

        } catch (createError: unknown) {
            console.error('Webhook: ERROR during Order creation or stock update:', createError);
            // Log Mongoose validation errors if available
            if (createError instanceof mongoose.Error.ValidationError) {
                console.error('Webhook: Mongoose Validation Errors:', createError.errors);
            }
            // Return a non-200 status to Stripe to signal failure and trigger retry
            return NextResponse.json({ success: false, message: `Order creation failed: ${createError instanceof Error ? createError.message : 'Unknown error'}` }, { status: 500 });
        }
        break;

      // Handle other event types as needed
      case 'payment_intent.succeeded':
        console.log('Webhook: payment_intent.succeeded event received.');
        break;
      case 'charge.failed':
        console.log('Webhook: charge.failed event received.');
        break;
      default:
        console.log(`Webhook: Unhandled event type ${event.type}`);
    }

    console.log('Webhook: Event processing complete. Returning 200 OK.');
    // Return a 200 response to Stripe to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) { // Changed 'any' to 'unknown'
    console.error('Webhook: Top-level ERROR processing webhook event:', error);
    // Return a 500 response if your server encounters an error during processing
    return NextResponse.json({ success: false, message: `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  } finally {
    console.log('--- Webhook End ---');
  }
}

