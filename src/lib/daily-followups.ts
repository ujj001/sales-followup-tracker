import { prisma } from "@/lib/prisma";
import { emailConfigured, sendEmail } from "@/lib/email";

const TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 5 * 60 + 30;

type CompanyRow = {
  name: string;
  contactName: string;
  salesRep: string | null;
  salesRepEmail: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  nextFollowUp: Date;
};

type RepDigest = {
  name: string;
  email: string;
  companies: CompanyRow[];
};

export type DailyFollowupResult = {
  email: string;
  rep: string;
  due: number;
  assigned: number;
  status: "sent" | "would-send" | "already-sent";
};

function istDayBounds(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const date = shifted.getUTCDate();
  const start = new Date(
    Date.UTC(year, month, date, 0, 0, 0, 0) -
      IST_OFFSET_MINUTES * 60 * 1000,
  );
  const end = new Date(
    Date.UTC(year, month, date, 23, 59, 59, 999) -
      IST_OFFSET_MINUTES * 60 * 1000,
  );
  return { start, end };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

function relativeDay(date: Date, todayStart: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const today = new Date(todayStart);
  today.setUTCHours(0, 0, 0, 0);
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 1) return "Tomorrow";
  return `in ${diff} days`;
}

function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildDueHtml(rep: RepDigest, dueCompanies: CompanyRow[], today: string) {
  const rows = dueCompanies
    .map(
      (company) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(company.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${escapeHtml(company.contactName)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${escapeHtml(company.phone) || "-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#b45309">${formatDate(company.nextFollowUp)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563">${escapeHtml(company.notes) || "-"}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:720px;margin:0 auto;color:#0f172a">
      <h2>Hi ${escapeHtml(rep.name)}, you have ${dueCompanies.length} follow-up${dueCompanies.length === 1 ? "" : "s"} due</h2>
      <p style="color:#475569">Here are your follow-ups due or overdue as of ${today}.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="text-align:left;color:#64748b;background:#f8fafc">
            <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Company</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Contact</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Phone</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Due</th>
            <th style="padding:8px 12px;border-bottom:2px solid #e2e8f0">Notes</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Sent by Sales Follow-up Manager from Neon data.</p>
    </div>`;
}

function buildNoDueHtml(rep: RepDigest, today: string) {
  return `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
      <h2>Hi ${escapeHtml(rep.name)}, no follow-ups are due today</h2>
      <p style="color:#475569">You have no overdue or due follow-ups as of ${today}.</p>
      <p style="color:#64748b">This daily check was sent from the shared Neon database.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Sent by Sales Follow-up Manager.</p>
    </div>`;
}

export async function runDailyFollowupEmails({
  dryRun = false,
}: {
  dryRun?: boolean;
} = {}): Promise<DailyFollowupResult[]> {
  if (!emailConfigured()) {
    throw new Error("Email provider is not configured.");
  }

  const { start, end } = istDayBounds();
  const today = formatDate(start);

  const companies = await prisma.company.findMany({
    where: { salesRepEmail: { not: null } },
    orderBy: [{ salesRepEmail: "asc" }, { nextFollowUp: "asc" }],
  });

  const groups = new Map<string, RepDigest>();
  for (const company of companies) {
    const email = company.salesRepEmail?.trim().toLowerCase();
    if (!email) continue;
    if (!groups.has(email)) {
      groups.set(email, {
        name: company.salesRep?.trim() || email,
        email,
        companies: [],
      });
    }
    groups.get(email)!.companies.push(company);
  }

  const results: DailyFollowupResult[] = [];

  for (const rep of groups.values()) {
    const dueCompanies = rep.companies.filter(
      (company) => company.nextFollowUp <= end,
    );
    const hasDue = dueCompanies.length > 0;
    const subject = hasDue
      ? `Daily follow-ups: ${dueCompanies.length} due today`
      : "Daily follow-ups: none due today";
    const html = hasDue
      ? buildDueHtml(rep, dueCompanies, today)
      : buildNoDueHtml(rep, today);
    const text = hasDue
      ? `Hi ${rep.name}, you have ${dueCompanies.length} follow-up${
          dueCompanies.length === 1 ? "" : "s"
        } due: ${dueCompanies
          .map(
            (company) =>
              `${company.name} (${relativeDay(company.nextFollowUp, start)})`,
          )
          .join(", ")}`
      : `Hi ${rep.name}, no follow-ups are due today (${today}).`;

    if (dryRun) {
      results.push({
        email: rep.email,
        rep: rep.name,
        due: dueCompanies.length,
        assigned: rep.companies.length,
        status: "would-send",
      });
      continue;
    }

    try {
      await prisma.notificationLog.create({
        data: {
          repEmail: rep.email,
          sentForDate: start,
          companyCount: dueCompanies.length,
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        results.push({
          email: rep.email,
          rep: rep.name,
          due: dueCompanies.length,
          assigned: rep.companies.length,
          status: "already-sent",
        });
        continue;
      }
      throw error;
    }

    try {
      await sendEmail({ to: rep.email, subject, html, text });
      results.push({
        email: rep.email,
        rep: rep.name,
        due: dueCompanies.length,
        assigned: rep.companies.length,
        status: "sent",
      });
    } catch (error) {
      await prisma.notificationLog.delete({
        where: {
          repEmail_sentForDate: {
            repEmail: rep.email,
            sentForDate: start,
          },
        },
      });
      throw error;
    }
  }

  return results;
}
