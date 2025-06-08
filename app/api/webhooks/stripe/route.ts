import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { buffer } from 'micro'; // For parsing raw body
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CartItem } from '@/lib/type';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Disable body parsing for this route as we need the raw body for Stripe signature verification
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
  // Get the raw body for signature verification
  const buf = await buffer(req);
  const signature = headers().get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Your Stripe webhook signing secret

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      console.error('Stripe-Signature header or STRIPE_WEBHOOK_SECRET missing.');
      return NextResponse.json({ success: false, message: 'Webhook secret or signature missing.' }, { status: 400 });
    }
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(buf.toString(), signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ success: false, message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect(); // Ensure database connection

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Stripe Webhook: checkout.session.completed event received.');

        // Extract relevant data from session metadata
        const userId = session.metadata?.userId;
        const cart: CartItem[] = JSON.parse(session.metadata?.cart || '[]');
        const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to dollars

        if (!userId || cart.length === 0 || totalAmount === 0) {
          console.error('Missing data in checkout.session.completed metadata.');
          return NextResponse.json({ received: true, message: 'Missing metadata.' }, { status: 400 }); // Return 400 to Stripe
        }

        // 1. Create a new Order in your database
        // First, check if an order with this stripeSessionId already exists to prevent duplicates
        const existingOrder = await Order.findOne({ stripeSessionId: session.id });
        if (existingOrder) {
          console.warn(`Order with Stripe Session ID ${session.id} already exists. Skipping creation.`);
          return NextResponse.json({ received: true, message: 'Order already exists.' }, { status: 200 });
        }

        const newOrder: IOrder = await Order.create({
          userId: userId,
          items: cart,
          totalAmount: totalAmount,
          paymentStatus: 'paid', // Mark as paid
          orderStatus: 'pending', // Initial order fulfillment status
          stripeSessionId: session.id,
        });
        console.log('New Order Created:', newOrder._id);

        // 2. Decrement product stock based on `cart`
        // Iterate through each item in the cart and update product stock
        for (const item of cart) {
          const product = await Product.findById(item.productId);
          if (product) {
            // Ensure stock doesn't go below zero
            const newStock = Math.max(0, product.stock - item.quantity);
            await Product.findByIdAndUpdate(item.productId, { stock: newStock });
            console.log(`Updated stock for product ${item.name}: ${product.stock} -> ${newStock}`);
          } else {
            console.warn(`Product with ID ${item.productId} not found for stock decrement.`);
          }
        }
        break;

      // Handle other event types as needed
      case 'payment_intent.succeeded':
        // Handle successful payment intents (if you use Payment Intents API directly)
        console.log('Stripe Webhook: payment_intent.succeeded event received.');
        break;
      case 'charge.failed':
        // Handle failed charges
        console.log('Stripe Webhook: charge.failed event received.');
        const failedCharge = event.data.object as Stripe.Charge;
        // You might want to update order payment status to 'failed' here
        // based on metadata from the Payment Intent if available
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to Stripe to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook event:', error);
    // Return a 500 response if your server encounters an error during processing
    return NextResponse.json({ success: false, message: 'Error processing webhook.' }, { status: 500 });
  }
}
