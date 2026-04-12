import { NextResponse } from "next/server";
import { pickRandomPair } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [a, b] = pickRandomPair();
    return NextResponse.json({
      pair: [
        { id: a.id, name: a.name, image: a.image },
        { id: b.id, name: b.name, image: b.image },
      ],
    });
  } catch {
    return NextResponse.json(
      { error: "catalog_error", message: "Could not build a pair" },
      { status: 500 },
    );
  }
}
