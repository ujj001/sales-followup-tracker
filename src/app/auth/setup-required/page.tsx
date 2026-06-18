export default function AuthSetupRequiredPage() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-6">
      <h1 className="text-lg font-semibold text-amber-950">
        Neon Auth setup required
      </h1>
      <p className="mt-2 text-sm text-amber-900">
        Add NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET to the deployment
        environment before this app can accept sign-ins.
      </p>
    </div>
  );
}
