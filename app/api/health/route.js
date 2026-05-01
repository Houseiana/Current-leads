import { NextResponse } from "next/server";
import {
  bootstrapStatus,
  ensureBootstrapped,
  schemaDetails,
} from "@/lib/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const shouldBootstrap = url.searchParams.get("bootstrap") === "1";
  const wantDetails = url.searchParams.get("details") === "1";

  if (shouldBootstrap) {
    try {
      const result = await ensureBootstrapped();
      const payload = {
        bootstrapped: true,
        seeded: result.seeded,
        ...(await bootstrapStatus()),
      };
      if (wantDetails) payload.schema = await schemaDetails();
      return NextResponse.json(payload);
    } catch (err) {
      return NextResponse.json(
        { error: err.message, ...(await bootstrapStatus()) },
        { status: 500 }
      );
    }
  }

  const payload = await bootstrapStatus();
  if (wantDetails && payload.db.connected) {
    try {
      payload.schema = await schemaDetails();
    } catch (err) {
      payload.schemaError = err.message;
    }
  }
  return NextResponse.json(payload);
}
