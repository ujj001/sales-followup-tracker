import { prisma } from "@/lib/prisma";
import { sendEmail, emailConfigured } from "@/lib/email";
import { startOfToday, endOfToday, formatShort, relativeDay } from "@/lib/dates";

type RepGroup = {
  name: string;
  email: string;
  companies: {
    name: string;
    contactName: string;
    nextFollowUp: Date;
    notes: string | null;
  }[];
};

export type NotifyResult = {
  email: string;
  rep: string;
  count: number;
  status: "sent" | "already-sent" | "error";
  error?: string;
};

function buildHtml(group: RepGroup): string {
  const rows = group.companies
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee">${c.contactName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${
          c.nextFollowUp < startOfToday() ? "#dc2626" : "#d97706"
        }">${relativeDay(c.nextFollowUp)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555">${
          c.notes ?? "—"
        }</td>
      </tr>`,
    )
    .join("");

  return `
  <div style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:0 auto">
    <h2 style="color:#0f172a">Hi ${group.name}, you have ${group.companies.length} pending follow-up${
      group.companies.length === 1 ? "" : "s"
    }</h2>
    <p style="color:#475569">These are overdue or due today (${formatShort(new Date())}).</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="text-align:left;color:#64748b">
          <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Company</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Contact</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Due</th>
          <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">Sent by Sales Follow-up Manager.</p>
  </div>`;
}

// Notify each rep at most once per this many hours.
const NOTIFY_INTERVAL_HOURS = 3;

// Group pending follow-ups by rep email and send each rep their own digest.
// Deduped to once per rep per NOTIFY_INTERVAL_HOURS window via NotificationLog
// (safe to call from many machines — only the first call in each window sends).
export async function runPendingNotifications(): Promise<NotifyResult[]> {
  if (!emailConfigured()) {
    return [
      { email: "", rep: "", count: 0, status: "error", error: "Email provider not configured" },
    ];
  }

  // Start of the current N-hour window (e.g. 00:00, 03:00, 06:00 … for 3h).
  const intervalMs = NOTIFY_INTERVAL_HOURS * 60 * 60 * 1000;
  const windowStart = new Date(Math.floor(Date.now() / intervalMs) * intervalMs);

  const pending = await prisma.company.findMany({
    where: {
      nextFollowUp: { lte: endOfToday() },
      salesRepEmail: { not: null },
    },
    orderBy: { nextFollowUp: "asc" },
  });

  // Group by rep email.
  const groups = new Map<string, RepGroup>();
  for (const c of pending) {
    const email = c.salesRepEmail!;
    if (!groups.has(email)) {
      groups.set(email, {
        name: c.salesRep ?? email,
        email,
        companies: [],
      });
    }
    groups.get(email)!.companies.push({
      name: c.name,
      contactName: c.contactName,
      nextFollowUp: c.nextFollowUp,
      notes: c.notes,
    });
  }

  const results: NotifyResult[] = [];

  for (const group of groups.values()) {
    // Claim this window's slot first so concurrent machines can't double-send.
    try {
      await prisma.notificationLog.create({
        data: {
          repEmail: group.email,
          sentForDate: windowStart,
          companyCount: group.companies.length,
        },
      });
    } catch (e: unknown) {
      // Unique violation → already notified this window.
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code?: string }).code === "P2002"
      ) {
        results.push({
          email: group.email,
          rep: group.name,
          count: group.companies.length,
          status: "already-sent",
        });
        continue;
      }
      throw e;
    }

    // Send. If it fails, release the slot so a later trigger can retry.
    try {
      await sendEmail({
        to: group.email,
        subject: `You have ${group.companies.length} pending follow-up${
          group.companies.length === 1 ? "" : "s"
        }`,
        html: buildHtml(group),
      });

      results.push({
        email: group.email,
        rep: group.name,
        count: group.companies.length,
        status: "sent",
      });
    } catch (err) {
      await prisma.notificationLog.deleteMany({
        where: { repEmail: group.email, sentForDate: windowStart },
      });
      results.push({
        email: group.email,
        rep: group.name,
        count: group.companies.length,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
