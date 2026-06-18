import { createNeonAuth } from "@neondatabase/auth/next/server";

const neonAuthBaseUrl =
  process.env.NEON_AUTH_BASE_URL ?? process.env.VITE_NEON_AUTH_URL;

export const AUTH_CONFIGURED = Boolean(
  neonAuthBaseUrl && process.env.NEON_AUTH_COOKIE_SECRET,
);

export const auth = createNeonAuth({
  baseUrl: neonAuthBaseUrl ?? "https://missing-neon-auth.invalid",
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ??
      "missing-neon-auth-cookie-secret-32-chars",
    sessionDataTtl: 300,
  },
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "error",
});
