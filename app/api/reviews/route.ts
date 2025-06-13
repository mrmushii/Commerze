import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import { IReview } from '@/lib/type';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const reviews: IReview[] = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching recent reviews:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch recent reviews: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
