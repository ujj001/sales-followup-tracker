"use client";

import { useRouter } from "next/navigation";

// Rep dropdown that filters the dashboard immediately on selection
// (navigates to /?rep=... — no separate "Filter" button needed).
export function RepFilter({
  reps,
  current,
}: {
  reps: string[];
  current: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-500">Rep</label>
      <select
        value={current}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value ? `/?rep=${encodeURIComponent(value)}` : "/");
        }}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="">Everyone</option>
        {reps.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
