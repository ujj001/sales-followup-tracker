import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function describeUrl(value: string | undefined) {
  if (!value) return null;
  const url = new URL(value);
  return {
    host: url.host,
    database: url.pathname,
    user: url.username ? `${url.username.slice(0, 3)}***` : "",
  };
}

async function main() {
  const database = describeUrl(process.env.DATABASE_URL);
  const direct = describeUrl(process.env.DIRECT_URL);

  if (!database) {
    throw new Error("DATABASE_URL is not set. Add the shared Neon URL to .env.");
  }

  const [companies, callLogs, notificationLogs, latestCompanies] =
    await Promise.all([
      prisma.company.count(),
      prisma.callLog.count(),
      prisma.notificationLog.count(),
      prisma.company.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          name: true,
          salesRep: true,
          nextFollowUp: true,
          updatedAt: true,
        },
      }),
    ]);

  console.log(
    JSON.stringify(
      {
        database,
        direct,
        counts: { companies, callLogs, notificationLogs },
        latestCompanies,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
