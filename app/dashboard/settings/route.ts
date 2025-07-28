// app/dashboard/settings/route.ts
import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.redirect(new URL('/settings/organization', 'http://localhost:3000'));
}
