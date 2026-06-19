import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/prisma";
import { runDailyFollowupEmails } from "../src/lib/daily-followups";

loadEnvConfig(process.cwd());

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const results = await runDailyFollowupEmails({ dryRun });

  if (results.length === 0) {
    console.log("No sales rep emails found in the database.");
    return;
  }

  for (const result of results) {
    if (result.status === "already-sent") {
      console.log(`Skipped daily email to ${result.email}: already sent today`);
      continue;
    }
    console.log(
      `${result.status === "would-send" ? "Would send" : "Sent"} daily email to ${result.email}: ${result.due} due, ${result.assigned} assigned`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
