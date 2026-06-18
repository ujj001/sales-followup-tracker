import { Resend } from "resend";

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// Which provider to use. Defaults to AgentMail if its key is present, else Resend.
export const emailProvider =
  process.env.EMAIL_PROVIDER ??
  (process.env.AGENTMAIL_API_KEY ? "agentmail" : "resend");

export function emailConfigured(): boolean {
  if (emailProvider === "agentmail") {
    return !!(process.env.AGENTMAIL_API_KEY && process.env.AGENTMAIL_INBOX_ID);
  }
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  if (emailProvider === "agentmail") {
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inboxId = process.env.AGENTMAIL_INBOX_ID;
    if (!apiKey || !inboxId) {
      throw new Error("AGENTMAIL_API_KEY / AGENTMAIL_INBOX_ID not set");
    }
    // Call the REST API directly (the npm SDK pulls in unrelated payment deps).
    const res = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inboxId)}/messages/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, html, text }),
      },
    );
    if (!res.ok) {
      throw new Error(`AgentMail send failed (${res.status}): ${await res.text()}`);
    }
    return;
  }

  // Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  const resend = new Resend(apiKey);
  const from =
    process.env.NOTIFY_FROM_EMAIL ?? "Follow-up Manager <onboarding@resend.dev>";
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) throw new Error(error.message);
}
