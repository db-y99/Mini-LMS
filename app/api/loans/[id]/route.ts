/**
 * Single Loan API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { loanModule } from '@modules';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const loan = await loanModule.getLoan(id);

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Failed to fetch loan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const loan = await loanModule.updateLoan(id, body);

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Failed to update loan:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    await loanModule.deleteLoan(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete loan:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
