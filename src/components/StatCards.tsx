import Link from "next/link";

export function StatCards({
  overdue,
  today,
  upcoming,
}: {
  overdue: number;
  today: number;
  upcoming: number;
}) {
  const cards = [
    {
      label: "Overdue",
      value: overdue,
      className: "border-red-200 bg-red-50 text-red-700",
    },
    {
      label: "Due Today",
      value: today,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      label: "Upcoming",
      value: upcoming,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border p-4 ${c.className}`}
        >
          <div className="text-3xl font-bold">{c.value}</div>
          <div className="text-sm font-medium">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
