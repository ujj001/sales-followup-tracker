import type { Metadata } from "next";
import Link from "next/link";
import "@neondatabase/auth-ui/css";
import "./globals.css";
import { LiveDataRefresh } from "@/components/LiveDataRefresh";
import { Providers } from "@/app/providers";
import { getCurrentUser, isAllowedEmail } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Sales Follow-up Manager",
  description: "Never miss a follow-up.",
};

export const dynamic = "force-dynamic";
export const preferredRegion = "sin1";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const allowedUser = isAllowedEmail(user?.email) ? user : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                Follow-up Manager
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                {allowedUser && (
                  <>
                    <Link
                      href="/"
                      className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      Today
                    </Link>
                    <Link
                      href="/companies"
                      className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      All Companies
                    </Link>
                    <Link
                      href="/companies/new"
                      className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
                    >
                      + Add Company
                    </Link>
                  </>
                )}
                {user ? (
                  <Link
                    href="/auth/sign-out"
                    className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Sign out
                  </Link>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
                  >
                    Sign in
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          {allowedUser && <LiveDataRefresh />}
        </Providers>
      </body>
    </html>
  );
}
