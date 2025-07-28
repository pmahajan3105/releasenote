import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.LINEAR_CLIENT_ID!;
const CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET!;
const REDIRECT_URI = process.env.LINEAR_OAUTH_REDIRECT_URI!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to Linear OAuth authorization URL
    const linearAuthorizeUrl = new URL('https://linear.app/oauth/authorize');
    linearAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    linearAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    linearAuthorizeUrl.searchParams.set('scope', 'read write'); // adjust scopes
    linearAuthorizeUrl.searchParams.set('response_type', 'code');

    return NextResponse.redirect(linearAuthorizeUrl.toString());
  }

  // Step 2: Exchange code for access token
  const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      code,
      redirectUri: REDIRECT_URI,
      grantType: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error_description || 'OAuth token exchange failed' }, { status: 400 });
  }

  const accessToken = tokenData.access_token as string;

  // TODO: Save accessToken securely linked to the authenticated user

  return NextResponse.redirect('/dashboard/integrations');
}
