import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { endOfToday, startOfToday, formatShort, relativeDay } from "@/lib/dates";
import { StatCards } from "@/components/StatCards";
import { CompleteCallModal } from "@/components/CompleteCallModal";
import { RepFilter } from "@/components/RepFilter";

// Always render fresh — follow-up state is time-sensitive.
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ rep?: string }>;
}) {
  const { rep } = await searchParams;
  const repFilter = (rep ?? "").trim();
  const today = startOfToday();
  const todayEnd = endOfToday();

  // Scope every query to the selected rep (if any).
  const repWhere = repFilter ? { salesRep: repFilter } : {};

  const [dueList, overdueCount, todayCount, upcomingCount, repRows] =
    await Promise.all([
      // Due today OR overdue (nextFollowUp <= end of today)
      prisma.company.findMany({
        where: { ...repWhere, nextFollowUp: { lte: todayEnd } },
        orderBy: { nextFollowUp: "asc" },
      }),
      prisma.company.count({
        where: { ...repWhere, nextFollowUp: { lt: today } },
      }),
      prisma.company.count({
        where: { ...repWhere, nextFollowUp: { gte: today, lte: todayEnd } },
      }),
      prisma.company.count({
        where: { ...repWhere, nextFollowUp: { gt: todayEnd } },
      }),
      // Distinct rep names for the filter dropdown.
      prisma.company.findMany({
        where: { salesRep: { not: null } },
        distinct: ["salesRep"],
        select: { salesRep: true },
        orderBy: { salesRep: "asc" },
      }),
    ]);

  const reps = repRows.map((r) => r.salesRep).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">
          Today&apos;s Follow-ups ({dueList.length})
        </h1>
        <RepFilter reps={reps} current={repFilter} />
      </div>

      <StatCards
        overdue={overdueCount}
        today={todayCount}
        upcoming={upcomingCount}
      />

      <section>
        {dueList.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            🎉 {repFilter ? `${repFilter} is` : "You're"} all caught up — no
            follow-ups due.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <Th>Company</Th>
                  <Th>Contact</Th>
                  <Th>Sales Rep</Th>
                  <Th>Last Contacted</Th>
                  <Th>Due</Th>
                  <Th>Notes</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dueList.map((c) => {
                  const isOverdue = c.nextFollowUp < today;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <Td>
                        <Link
                          href={`/companies/${c.id}/edit`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {c.name}
                        </Link>
                      </Td>
                      <Td>{c.contactName}</Td>
                      <Td>
                        {c.salesRep ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {c.salesRep}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </Td>
                      <Td className="text-slate-600">
                        {formatShort(c.lastContacted)}
                      </Td>
                      <Td>
                        <span
                          className={
                            isOverdue
                              ? "font-medium text-red-600"
                              : "font-medium text-amber-600"
                          }
                        >
                          {relativeDay(c.nextFollowUp)}
                        </span>
                      </Td>
                      <Td className="max-w-xs truncate text-slate-600">
                        {c.notes || "—"}
                      </Td>
                      <Td className="text-right">
                        <CompleteCallModal
                          companyId={c.id}
                          companyName={c.name}
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
