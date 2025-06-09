import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Products';
import { IProduct } from '@/lib/type';

interface CustomSessionClaims {
  publicMetadata?: {
    role?: string;
  };
}

export async function GET() {
  await dbConnect();
  try {
    const products: IProduct[] = await Product.find({});
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const { userId, sessionClaims } = await auth();

  const claims = sessionClaims as CustomSessionClaims;

  // ✅ Use `publicMetadata`
  // if (!userId || claims?.publicMetadata?.role !== 'admin') {
  //   return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
  // }

  try {
    const body = await req.json();
    const product: IProduct = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 400 }
    );
  }
}
