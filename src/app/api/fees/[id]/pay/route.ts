import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import Fee, { FeeStatus } from '@/lib/models/Fee';
import connectDB from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAuth(req);
    await connectDB();

    const resolvedParams = await params;
    const { amount, method, reference } = await req.json();

    const fee = await Fee.findById(resolvedParams.id);
    if (!fee) {
      return NextResponse.json({ message: 'Fee record not found' }, { status: 404 });
    }

    if (fee.status === FeeStatus.PAID) {
      return NextResponse.json({ message: 'Fee is already fully paid' }, { status: 400 });
    }

    const newPaidAmount = fee.paidAmount + Number(amount);
    fee.paidAmount = newPaidAmount;
    fee.lastPaymentDate = new Date();

    if (newPaidAmount >= fee.totalAmount) {
      fee.status = FeeStatus.PAID;
      fee.paidAmount = fee.totalAmount; // Cap it
    } else if (newPaidAmount > 0) {
      fee.status = FeeStatus.PARTIAL;
    }

    if (!fee.payments) {
      fee.payments = [];
    }
    
    fee.payments.push({
      amount: Number(amount),
      date: new Date(),
      method: method || 'Cash',
      reference: reference || ''
    });

    await fee.save();
    
    const populated = await fee.populate(['student', 'department']);
    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
