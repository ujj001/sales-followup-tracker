import Link from "next/link";
import { allowedEmailDomain } from "@/lib/auth/guards";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Access restricted</h1>
      <p className="mt-2 text-sm text-slate-600">
        This app is only available to @{allowedEmailDomain} accounts.
      </p>
      <Link
        href="/auth/sign-out"
        className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Sign out
      </Link>
    </div>
  );
}
