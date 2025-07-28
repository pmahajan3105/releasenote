import { NextResponse } from "next/server";

const CLIENT_ID = process.env.LINEAR_CLIENT_ID!;
const REDIRECT_URI = process.env.LINEAR_OAUTH_REDIRECT_URI!;

export async function GET() {
  const linearAuthorizeUrl = new URL("https://linear.app/oauth/authorize");
  linearAuthorizeUrl.searchParams.set("client_id", CLIENT_ID);
  linearAuthorizeUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  linearAuthorizeUrl.searchParams.set("scope", "read write"); // adjust scopes as needed
  linearAuthorizeUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(linearAuthorizeUrl.toString());
}
