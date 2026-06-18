import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCompany } from "@/app/actions";
import { CompanyForm } from "@/components/CompanyForm";
import { formatShort } from "@/lib/dates";
import { requireAllowedUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAllowedUser();

  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: { calls: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!company) notFound();

  const updateAction = updateCompany.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Edit — {company.name}
      </h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CompanyForm
          action={updateAction}
          company={company}
          submitLabel="Save Changes"
        />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">
          Call History
        </h2>
        {company.calls.length === 0 ? (
          <p className="text-sm text-slate-500">No calls logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {company.calls.map((call) => (
              <li
                key={call.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">
                    {call.outcome}
                  </span>
                  <span className="text-slate-500">
                    {formatShort(call.createdAt)} → next{" "}
                    {formatShort(call.nextFollowUp)}
                  </span>
                </div>
                {call.note && (
                  <p className="mt-1 text-slate-600">{call.note}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
