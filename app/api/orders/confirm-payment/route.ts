// app/api/orders/confirm-payment/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Products';
import { IOrder, CartItem } from '@/lib/type';
import mongoose from 'mongoose';

/**
 * Handles POST requests to confirm a payment and update a pending order.
 * This route is called by the frontend /success page to immediately mark an order as paid
 * and decrement stock, providing quick UI feedback. The webhook remains the source of truth.
 *
 * @param {Request} req - The incoming request object containing sessionId.
 * @returns {NextResponse} A JSON response with the confirmed order or an error.
 */
export async function POST(req: Request) {
  await dbConnect();
  console.log('--- Confirm Payment API Start ---');

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      console.error('Confirm Payment API: Missing sessionId.');
      return NextResponse.json({ success: false, message: 'Session ID is required.' }, { status: 400 });
    }

    console.log('Confirm Payment API: Received sessionId:', sessionId);

    // Find the pending order using the stripeSessionId
    const orderToConfirm = await Order.findOne({ stripeSessionId: sessionId, paymentStatus: 'pending' });

    if (!orderToConfirm) {
      console.warn(`Confirm Payment API: No pending order found for sessionId: ${sessionId}. Checking if already paid or non-existent.`);
      // Check if order already exists and is paid (e.g., webhook processed faster)
      const existingPaidOrder = await Order.findOne({ stripeSessionId: sessionId, paymentStatus: 'paid' });
      if (existingPaidOrder) {
          console.log(`Confirm Payment API: Order for sessionId ${sessionId} already paid (ID: ${existingPaidOrder._id}). Returning existing order.`);
          return NextResponse.json({ success: true, data: existingPaidOrder }, { status: 200 });
      }
      console.error(`Confirm Payment API: Order for sessionId ${sessionId} not found or not pending.`);
      return NextResponse.json({ success: false, message: 'Order not found or already processed.' }, { status: 404 });
    }

    console.log(`Confirm Payment API: Found pending order ID: ${orderToConfirm._id.toString()}.`);

    // Mark the order as paid and processing
    orderToConfirm.paymentStatus = 'paid';
    orderToConfirm.orderStatus = 'processing'; // Or 'shipped', 'pending' based on desired initial state
    await orderToConfirm.save();
    console.log(`Confirm Payment API: Order ${orderToConfirm._id.toString()} updated to paid/processing.`);

    // Decrement product stock
    console.log('Confirm Payment API: Attempting to decrement product stock...');
    for (const item of orderToConfirm.items) {
      const product = await Product.findById(item.productId); // item.productId is already ObjectId from Order model
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await Product.findByIdAndUpdate(item.productId, { stock: newStock });
        console.log(`Confirm Payment API: Updated stock for product ${product.name}: ${product.stock} -> ${newStock}`);
      } else {
        console.warn(`Confirm Payment API: Product with ID ${item.productId} not found during stock decrement.`);
      }
    }
    console.log('Confirm Payment API: Stock decrement process complete.');

    return NextResponse.json({ success: true, data: orderToConfirm }, { status: 200 });

  } catch (error: unknown) {
    console.error('Confirm Payment API: ERROR during order confirmation or stock update:', error);
    if (error instanceof mongoose.Error.ValidationError) {
        console.error('Confirm Payment API: Mongoose Validation Errors:', JSON.stringify(error.errors, null, 2));
    }
    return NextResponse.json(
      { success: false, message: `Order confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    console.log('--- Confirm Payment API End ---');
  }
}
