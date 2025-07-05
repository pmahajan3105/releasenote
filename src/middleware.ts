import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Log entry for debugging - can be removed later
  console.log(`--- Middleware executing for path: ${request.nextUrl.pathname} ---`);

  // Allow all requests to proceed for now (hardcoded auth)
  return NextResponse.next();
}

// Keep the specific matcher configuration
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/auth-code-error).*) ',
  ],
}; 