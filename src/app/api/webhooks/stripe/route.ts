import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json({ message: 'Stripe is deprecated in this application. Razorpay is the active payment gateway.' });
}

