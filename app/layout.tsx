import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchmash",
  description: "Pick your favorite watch — pairwise Elo ranking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-zinc-100"
            >
              Watchmash
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link
                href="/duel"
                className="text-zinc-400 transition hover:text-zinc-100"
              >
                Duel
              </Link>
              <Link
                href="/leaderboard"
                className="text-zinc-400 transition hover:text-zinc-100"
              >
                Leaderboard
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
