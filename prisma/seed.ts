import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Reset the database to a clean, empty state (no demo data).
// ⚠️ This deletes ALL companies, call logs, and notification logs.
async function main() {
  await prisma.notificationLog.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.company.deleteMany();
  console.log("Database cleared. Companies:", await prisma.company.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
