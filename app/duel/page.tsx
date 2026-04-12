import { DuelClient } from "@/components/DuelClient";

export const dynamic = "force-dynamic";

export default function DuelPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Duel</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Random pair · Elo updates after each pick
        </p>
      </div>
      <DuelClient />
    </div>
  );
}
