import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "";
  // #region agent log
  fetch("http://127.0.0.1:7606/ingest/e49cc500-10ed-4e17-9cc3-a0cf1b40cf2f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "6331cf",
    },
    body: JSON.stringify({
      sessionId: "6331cf",
      location: "middleware.ts",
      message: "incoming request",
      data: {
        hypothesisId: "H1-H3-H4",
        pathname,
        host,
        method: request.method,
      },
      timestamp: Date.now(),
      runId: "404-debug-1",
    }),
  }).catch(() => {});
  // #endregion
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
