import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { LiveDataRefresh } from "@/components/LiveDataRefresh";
import { NotifyTrigger } from "@/components/NotifyTrigger";

export const metadata: Metadata = {
  title: "Sales Follow-up Manager",
  description: "Never miss a follow-up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              📞 Follow-up Manager
            </Link>
            <nav className="flex items-center gap-1 text-sm">
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
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <LiveDataRefresh />
        <NotifyTrigger />
      </body>
    </html>
  );
}
