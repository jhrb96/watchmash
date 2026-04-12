import { appendFileSync, mkdirSync } from "fs";
import Link from "next/link";
import { dirname, join } from "path";
import { headers } from "next/headers";

export default async function NotFound() {
  const h = await headers();
  const referer = h.get("referer") ?? "";
  const vercelId = h.get("x-vercel-id") ?? "";
  // #region agent log
  const agentPayload = {
    sessionId: "6331cf",
    location: "app/not-found.tsx",
    message: "Next.js app not-found rendered",
    data: {
      hypothesisId: "H1-H3",
      refererLen: referer.length,
      hasVercelId: Boolean(vercelId),
    },
    timestamp: Date.now(),
    runId: "404-debug-1",
  };
  fetch("http://127.0.0.1:7606/ingest/e49cc500-10ed-4e17-9cc3-a0cf1b40cf2f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "6331cf",
    },
    body: JSON.stringify(agentPayload),
  }).catch(() => {});
  try {
    const logPath = join(process.cwd(), ".cursor", "debug-6331cf.log");
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${JSON.stringify(agentPayload)}\n`);
  } catch {
    // ignore (e.g. read-only deploy FS)
  }
  // #endregion

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-zinc-100">Page not found</h1>
      <p className="text-sm text-zinc-400">
        No route matches this URL. Use{" "}
        <Link href="/" className="text-yellow-500 underline">
          Home
        </Link>
        ,{" "}
        <Link href="/duel" className="text-yellow-500 underline">
          Duel
        </Link>
        , or{" "}
        <Link href="/leaderboard" className="text-yellow-500 underline">
          Leaderboard
        </Link>
        .
      </p>
    </div>
  );
}
