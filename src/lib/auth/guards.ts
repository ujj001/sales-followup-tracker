import { redirect } from "next/navigation";
import { auth, AUTH_CONFIGURED } from "@/lib/auth/server";

const DEFAULT_ALLOWED_DOMAIN = "equitylist.co";

export const allowedEmailDomain =
  process.env.ALLOWED_EMAIL_DOMAIN?.replace(/^@/, "") ?? DEFAULT_ALLOWED_DOMAIN;

type SessionUser = {
  email?: string | null;
  name?: string | null;
};

export function isAllowedEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase().endsWith(`@${allowedEmailDomain}`) ?? false;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!AUTH_CONFIGURED) return null;
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

export async function requireAllowedUser() {
  if (!AUTH_CONFIGURED) redirect("/auth/setup-required");

  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  if (!isAllowedEmail(user.email)) redirect("/auth/unauthorized");

  return user;
}
