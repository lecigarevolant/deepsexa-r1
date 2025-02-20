import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>();

const WINDOW_SIZE = 60000; // 1 minute
const MAX_REQUESTS = 20; // Maximum requests per minute

export function rateLimiter(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_SIZE;

  // Clean up old entries
  Array.from(rateLimit.entries()).forEach(([key, value]) => {
    if (value.timestamp < windowStart) {
      rateLimit.delete(key);
    }
  });

  // Get or create rate limit entry
  const currentLimit = rateLimit.get(ip) || { count: 0, timestamp: now };

  // Reset if outside window
  if (currentLimit.timestamp < windowStart) {
    currentLimit.count = 0;
    currentLimit.timestamp = now;
  }

  // Increment count
  currentLimit.count++;
  rateLimit.set(ip, currentLimit);

  return currentLimit.count <= MAX_REQUESTS;
}

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = request.ip || 'anonymous';
  const isAllowed = rateLimiter(ip);

  if (!isAllowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return NextResponse.next();
} 