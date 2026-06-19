export default function Loading() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-400" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
          <div className="h-10 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
