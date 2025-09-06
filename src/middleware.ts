import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Let API routes handle their own authentication
  // No middleware protection needed since API routes verify tokens directly
  return NextResponse.next();
}

export const config = {
  matcher: [],
};