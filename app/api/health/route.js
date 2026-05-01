import { NextResponse } from "next/server";
import { bootstrapStatus, ensureBootstrapped } from "@/lib/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const shouldBootstrap = url.searchParams.get("bootstrap") === "1";

  if (shouldBootstrap) {
    try {
      const result = await ensureBootstrapped();
      return NextResponse.json({
        bootstrapped: true,
        seeded: result.seeded,
        ...(await bootstrapStatus()),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err.message, ...(await bootstrapStatus()) },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(await bootstrapStatus());
}
