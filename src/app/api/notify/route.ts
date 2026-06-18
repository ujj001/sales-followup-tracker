import { NextResponse } from "next/server";
import { runPendingNotifications } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Triggered by the client while the app is open (and callable manually / by cron).
// Idempotent per rep per day, so it's safe to hit repeatedly from any machine.
export async function POST() {
  try {
    const results = await runPendingNotifications();
    const sent = results.filter((r) => r.status === "sent").length;
    return NextResponse.json({ ok: true, sent, results });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

// Allow manual checks in the browser too.
export async function GET() {
  return POST();
}
