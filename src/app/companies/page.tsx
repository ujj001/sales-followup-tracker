import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatShort, relativeDay, startOfToday, endOfToday } from "@/lib/dates";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const today = startOfToday();
  const todayEnd = endOfToday();

  const companies = await prisma.company.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { salesRep: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nextFollowUp: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          All Companies ({companies.length})
        </h1>
        <Link
          href="/companies/new"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Add Company
        </Link>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by company, contact, sales rep, email, phone…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Search
        </button>
        {query && (
          <Link
            href="/companies"
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Clear
          </Link>
        )}
      </form>

      {companies.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          {query
            ? `No companies match “${query}”.`
            : "No companies yet — add your first one."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Sales Rep</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Last Contacted</th>
                <th className="px-4 py-3 font-medium">Next Follow-up</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => {
                const isOverdue = c.nextFollowUp < today;
                const isToday =
                  c.nextFollowUp >= today && c.nextFollowUp <= todayEnd;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.contactName}
                    </td>
                    <td className="px-4 py-3">
                      {c.salesRep ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {c.salesRep}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatShort(c.lastContacted)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          isOverdue
                            ? "font-medium text-red-600"
                            : isToday
                              ? "font-medium text-amber-600"
                              : "text-slate-600"
                        }
                      >
                        {formatShort(c.nextFollowUp)} · {relativeDay(c.nextFollowUp)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/companies/${c.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={c.id} name={c.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
