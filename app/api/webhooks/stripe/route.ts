import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CartItem } from '@/lib/type';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = (await headers()).get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  console.log('--- Webhook Start ---');
  console.log('Webhook Request Headers:', Array.from((await headers()).entries()));
  console.log('Webhook Raw Body Length:', rawBody.length);
  console.log('Webhook Signature:', signature);
  console.log('Webhook Secret (from .env):', webhookSecret ? '******' : 'MISSING!');

  try {
    if (!signature || !webhookSecret) {
      console.error('Webhook: Signature or Secret missing. Signature:', signature, 'Secret exists:', !!webhookSecret);
      return NextResponse.json({ success: false, message: 'Webhook secret or signature missing.' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('Webhook: Signature verification SUCCESS.');
  } catch (err: unknown) {
    console.error(`Webhook: Signature verification FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`);
    console.log('Webhook: Full error object:', err);
    return NextResponse.json({ success: false, message: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 400 });
  }

  await dbConnect();
  console.log('Webhook: Database Connected.');

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Webhook: Processing checkout.session.completed event.');
        console.log('Webhook: Stripe Session ID:', session.id);
        console.log('Webhook: Stripe Metadata:', session.metadata);

        const userId = session.metadata?.userId;
        let cart: CartItem[] = [];
        try {
            cart = JSON.parse(session.metadata?.cart || '[]') as CartItem[];
        } catch (parseError: unknown) {
            console.error('Webhook: Failed to parse cart metadata:', parseError);
            return NextResponse.json({ received: true, message: `Invalid cart metadata: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}` }, { status: 400 });
        }
        const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

        if (!userId || cart.length === 0 || totalAmount === 0) {
          console.error('Webhook: Missing data in checkout.session.completed metadata (userId, cart, or totalAmount).');
          return NextResponse.json({ received: true, message: 'Missing metadata.' }, { status: 400 });
        }

        console.log('Webhook: Looking for pre-existing PENDING order with stripeSessionId:', session.id);
        const orderToUpdate = await Order.findOne({ stripeSessionId: session.id });

        if (!orderToUpdate) {
            console.warn(`Webhook: No PENDING order found for session ID ${session.id}. Attempting to create new order as fallback.`);
            try {
                const orderItemsForDb = cart.map(item => ({
                    ...item,
                    productId: new mongoose.Types.ObjectId(item.productId)
                }));
                const newOrder: IOrder = await Order.create({
                    userId: userId,
                    items: orderItemsForDb,
                    totalAmount: totalAmount,
                    paymentStatus: 'paid',
                    orderStatus: 'pending',
                    stripeSessionId: session.id,
                });
                console.log('Webhook: Fallback Order Created in DB with ID:', newOrder._id.toString());
                for (const item of cart) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        const newStock = Math.max(0, product.stock - item.quantity);
                        await Product.findByIdAndUpdate(item.productId, { stock: newStock });
                        console.log(`Webhook: Fallback Stock Updated for ${item.name}.`);
                    }
                }
                return NextResponse.json({ received: true, message: 'Fallback order created and processed.' }, { status: 200 });

            } catch (fallbackCreateError: unknown) {
                console.error('Webhook: ERROR during FALLBACK order creation or stock update:', fallbackCreateError);
                if (fallbackCreateError instanceof mongoose.Error.ValidationError) {
                    console.error('Webhook: Fallback Mongoose Validation Errors:', JSON.stringify(fallbackCreateError.errors, null, 2));
                }
                return NextResponse.json({ success: false, message: `Fallback order creation failed: ${fallbackCreateError instanceof Error ? fallbackCreateError.message : 'Unknown error'}` }, { status: 500 });
            }
        }

        if (orderToUpdate.paymentStatus === 'pending') {
            console.log(`Webhook: Updating existing PENDING order ${orderToUpdate._id} to 'paid'.`);
            orderToUpdate.paymentStatus = 'paid';
            orderToUpdate.orderStatus = 'processing';
            await orderToUpdate.save();
            console.log('Webhook: Existing Order Updated.');

            console.log('Webhook: Re-checking and decrementing stock...');
            for (const item of orderToUpdate.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await Product.findByIdAndUpdate(item.productId, { stock: newStock });
                    console.log(`Webhook: Updated stock for product ${product.name}: ${product.stock} -> ${newStock}`);
                } else {
                    console.warn(`Webhook: Product with ID ${item.productId} not found during stock decrement.`);
                }
            }
            console.log('Webhook: Stock decrement process complete for existing order.');

        } else {
            console.log(`Webhook: Order ${orderToUpdate._id} already has paymentStatus '${orderToUpdate.paymentStatus}'. No update needed from webhook.`);
        }
        break;

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
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Webhook: Top-level ERROR processing webhook event:', error);
    return NextResponse.json({ success: false, message: `Error processing webhook: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  } finally {
    console.log('--- Webhook End ---');
  }
}
