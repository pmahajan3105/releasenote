import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.SLACK_OAUTH_REDIRECT_URI!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect user to Slack authorize page
    const slackAuthorizeUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    slackAuthorizeUrl.searchParams.set('scope', 'channels:read chat:write'); // adjust scopes
    slackAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);

    return NextResponse.redirect(slackAuthorizeUrl.toString());
  }

  // Step 2: Exchange code for access token
  const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.ok) {
    return NextResponse.json({ error: tokenData.error || 'OAuth token exchange failed' }, { status: 400 });
  }

  const accessToken = tokenData.access_token as string;

  // TODO: Save accessToken securely linked to the authenticated user

  return NextResponse.redirect('/dashboard/integrations');
}
