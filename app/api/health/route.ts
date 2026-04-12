import { NextResponse } from "next/server";

/** Deployment smoke test: should return 200 on any live Vercel preview/production URL. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "watchmash" });
}
