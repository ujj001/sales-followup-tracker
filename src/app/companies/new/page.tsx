import { createCompany } from "@/app/actions";
import { CompanyForm } from "@/components/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-slate-900">
        Add Company
      </h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CompanyForm action={createCompany} submitLabel="Add Company" />
      </div>
    </div>
  );
}
