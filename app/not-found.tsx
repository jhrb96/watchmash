import Link from "next/link";

export default function NotFound() {
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
