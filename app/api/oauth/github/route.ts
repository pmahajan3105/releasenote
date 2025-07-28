import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI!; // e.g., https://yourdomain.com/api/oauth/github

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect user to GitHub authorize page
    const githubAuthorizeUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    githubAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    githubAuthorizeUrl.searchParams.set('scope', 'repo user'); // adjust scopes

    return NextResponse.redirect(githubAuthorizeUrl.toString());
  }

  // Step 2: Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return NextResponse.json({ error: tokenData.error_description || 'OAuth token exchange failed' }, { status: 400 });
  }

  const accessToken = tokenData.access_token as string;

  // TODO: Save accessToken securely linked to the authenticated user

  // Redirect back to your integrations page after success
  return NextResponse.redirect('/dashboard/integrations');
}
