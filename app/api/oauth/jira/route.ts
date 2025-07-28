import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.JIRA_CLIENT_ID!;
const CLIENT_SECRET = process.env.JIRA_CLIENT_SECRET!;
const REDIRECT_URI = process.env.JIRA_OAUTH_REDIRECT_URI!; // should be your registered redirect URI

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to Jira authorization URL
    const jiraAuthorizeUrl = new URL('https://auth.atlassian.com/authorize');
    jiraAuthorizeUrl.searchParams.set('audience', 'api.atlassian.com');
    jiraAuthorizeUrl.searchParams.set('client_id', CLIENT_ID);
    jiraAuthorizeUrl.searchParams.set('scope', 'read:jira-user read:jira-work write:jira-work'); // Adjust scopes
    jiraAuthorizeUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    jiraAuthorizeUrl.searchParams.set('response_type', 'code');
    jiraAuthorizeUrl.searchParams.set('prompt', 'consent');

    return NextResponse.redirect(jiraAuthorizeUrl.toString());
  }

  // Step 2: Exchange authorization code for access token
  const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
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
