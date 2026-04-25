import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { COOKIE_NAME } from "./lib/constants";

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  console.log("[MW] Path:", path, "Token:", !!token);

  if (!token) {
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  const payload = await verifyToken(token);
  console.log("[MW] Payload:", payload);

  if (!payload) {
    const url = new URL("/login", request.nextUrl.origin);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/my-tests/:path*",
    "/my-courses/:path*",
    "/attempt/:path*",
    "/analytics/:path*",
    "/bookmarks/:path*",
    "/leaderboard/:path*",
    "/custom-test/:path*",
    "/question-bank/:path*",
    "/result/:path*",
    "/solutions/:path*",
  ],
};
