/**
 * Health Check Endpoint
 * Used by load balancers and monitoring systems
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Add actual health checks
    // - Database connection
    // - Redis connection
    // - Disk space
    // - Memory usage

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}
