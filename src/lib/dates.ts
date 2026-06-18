// Date helpers. All "follow-up" comparisons are day-based (local time),
// so a follow-up is "due today" if its date falls anywhere within today.

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// today (local midnight) + n days, at midnight.
export function addDays(days: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + days);
  return d;
}

// Short, human display: "16 Jun"
export function formatShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// "Today", "Tomorrow", "2 days overdue", "in 3 days"
export function relativeDay(date: Date | string): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (d.getTime() - startOfToday().getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return `in ${diff} days`;
}

// For <input type="date"> value (YYYY-MM-DD) in local time.
export function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60 * 1000).toISOString().slice(0, 10);
}
