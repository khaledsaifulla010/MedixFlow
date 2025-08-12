
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

const rolePaths: Record<string, string> = {
  admin: "/dashboard/admin",
  doctor: "/dashboard/doctor",
  patient: "/dashboard/patient",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths don't need auth
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
  ];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get JWT token from cookie
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = jwt.verify(token, SECRET) as { id: string; role: string };

    const isDashboardPath = pathname.startsWith("/dashboard");

    if (isDashboardPath) {
      const allowedPath = rolePaths[payload.role];
      if (!allowedPath) {
        // Unknown role - redirect to login
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (!pathname.startsWith(allowedPath)) {
        // Redirect to correct dashboard
        return NextResponse.redirect(new URL(allowedPath, req.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
