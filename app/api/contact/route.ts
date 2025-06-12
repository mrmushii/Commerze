// app/api/contact/route.ts (Dummy endpoint for testing form submission)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received contact form submission:', data);

    // Simulate a delay or actual processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // You would typically send an email here or save to a database
    // e.g., sendEmail(data);

    return NextResponse.json({ success: true, message: 'Message received!' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json(
      { success: false, message: `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}