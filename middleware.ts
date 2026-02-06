import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware for internal routes and static files
  if (
    request.nextUrl.pathname.includes("/api/internal") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes("/mockServiceWorker.js")
  ) {
    return NextResponse.next();
  }

  // For mock environment, just pass through
  // Authentication will be handled in Server Components
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
