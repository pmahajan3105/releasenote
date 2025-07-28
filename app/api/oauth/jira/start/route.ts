import { NextResponse } from "next/server";

const CLIENT_ID = process.env.JIRA_CLIENT_ID!;
const REDIRECT_URI = process.env.JIRA_OAUTH_REDIRECT_URI!;

export async function GET() {
  const jiraAuthorizeUrl = new URL("https://auth.atlassian.com/authorize");

  jiraAuthorizeUrl.searchParams.set("audience", "api.atlassian.com");
  jiraAuthorizeUrl.searchParams.set("client_id", CLIENT_ID);
  jiraAuthorizeUrl.searchParams.set("scope", "read:jira-user read:jira-work write:jira-work"); // adjust as needed
  jiraAuthorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  jiraAuthorizeUrl.searchParams.set("response_type", "code");
  jiraAuthorizeUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(jiraAuthorizeUrl.toString());
}
