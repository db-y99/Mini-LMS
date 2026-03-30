/**
 * Loans API Route
 * Example of using modules in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { loanModule } from '@modules';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status');

    let loans;

    if (branchId) {
      loans = await loanModule.getLoansByBranch(branchId);
    } else if (status) {
      loans = await loanModule.getLoansByStatus(status);
    } else {
      loans = await loanModule.getLoans();
    }

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const loan = await loanModule.createLoan(body);

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    console.error('Failed to create loan:', error);
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
