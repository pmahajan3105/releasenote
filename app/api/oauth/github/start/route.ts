import { NextResponse } from "next/server";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI!;

export async function GET() {
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", CLIENT_ID);
  githubAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  githubAuthUrl.searchParams.set("scope", "repo user");

  return NextResponse.redirect(githubAuthUrl.toString());
}

// import { NextResponse } from 'next/server';

// const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
// const REDIRECT_URI = process.env.GITHUB_OAUTH_REDIRECT_URI!;

// export async function GET() {
//   const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
//   githubAuthUrl.searchParams.set("client_id", CLIENT_ID);
//   githubAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
//   githubAuthUrl.searchParams.set("scope", "repo user"); // adjust scopes as needed

//   return NextResponse.redirect(githubAuthUrl.toString());
// }
