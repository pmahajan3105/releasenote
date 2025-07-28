import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch real integration connection status for user from your DB/session
  // For demo, return dummy statuses

  const dummyStatus = {
    github: false,
    jira: false,
    linear: false,
    slack: false,
  };

  return NextResponse.json(dummyStatus);
}
