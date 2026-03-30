/**
 * Workflow Transition API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowModule } from '@modules';
import { CanonicalLoanStatus } from '@/constants/status';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loanId, toStatus, user, metadata } = body;

    if (!loanId || !toStatus || !user) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await workflowModule.transitionLoan(
      loanId,
      toStatus as CanonicalLoanStatus,
      user,
      metadata
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Workflow transition failed:', error);
    return NextResponse.json(
      { error: error.message || 'Transition failed' },
      { status: 400 }
    );
  }
}
