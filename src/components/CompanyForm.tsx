import Link from "next/link";
import { toDateInput } from "@/lib/dates";

type CompanyData = {
  id: string;
  name: string;
  contactName: string;
  salesRep: string | null;
  salesRepEmail: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  lastContacted: Date | null;
  nextFollowUp: Date;
};

export function CompanyForm({
  action,
  company,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  company?: CompanyData;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company Name" required>
          <input
            name="name"
            required
            defaultValue={company?.name ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Contact Name" required>
          <input
            name="contactName"
            required
            defaultValue={company?.contactName ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Sales Rep" required>
          <input
            name="salesRep"
            required
            placeholder="Who follows up?"
            defaultValue={company?.salesRep ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Sales Rep Email" required>
          <input
            name="salesRepEmail"
            type="email"
            required
            placeholder="rep@company.com (gets the reminders)"
            defaultValue={company?.salesRepEmail ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Phone Number">
          <input
            name="phone"
            type="tel"
            defaultValue={company?.phone ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            defaultValue={company?.email ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Last Contacted">
          <input
            name="lastContacted"
            type="date"
            defaultValue={toDateInput(company?.lastContacted)}
            className={inputCls}
          />
        </Field>
        <Field label="Next Follow-up Date" required>
          <input
            name="nextFollowUp"
            type="date"
            required
            defaultValue={toDateInput(company?.nextFollowUp ?? new Date())}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          name="notes"
          rows={3}
          defaultValue={company?.notes ?? ""}
          className={inputCls}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Link
          href="/companies"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
