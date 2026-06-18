import { auth, AUTH_CONFIGURED } from "@/lib/auth/server";
import { NextResponse, type NextRequest } from "next/server";

const authMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

export default function proxy(request: NextRequest) {
  if (!AUTH_CONFIGURED) {
    return NextResponse.redirect(new URL("/auth/setup-required", request.url));
  }

  return authMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth(?:/.*)?|api/auth(?:/.*)?).*)",
  ],
};
