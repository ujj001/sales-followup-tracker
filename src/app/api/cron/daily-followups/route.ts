import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runDailyFollowupEmails } from "@/lib/daily-followups";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runDailyFollowupEmails();
    return NextResponse.json({
      ok: true,
      sent: results.filter((result) => result.status === "sent").length,
      skipped: results.filter((result) => result.status === "already-sent").length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
