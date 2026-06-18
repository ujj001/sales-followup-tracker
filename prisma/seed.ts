import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Build a date at local midnight, offset by `days` from today.
function dayOffset(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  await prisma.callLog.deleteMany();
  await prisma.company.deleteMany();

  await prisma.company.createMany({
    data: [
      {
        name: "Pronto",
        contactName: "Aman",
        salesRep: "Rohit",
        salesRepEmail: "ujjwal@equitylist.co",
        phone: "+91 98765 43210",
        email: "aman@pronto.io",
        notes: "Asked to call after board meeting",
        lastContacted: dayOffset(-2),
        nextFollowUp: dayOffset(-2), // overdue
      },
      {
        name: "Vyapar",
        contactName: "Neha",
        salesRep: "Priya",
        salesRepEmail: "priya@example.com",
        phone: "+91 91234 56780",
        email: "neha@vyapar.com",
        notes: "Didn't pick up",
        lastContacted: dayOffset(-2),
        nextFollowUp: dayOffset(-1), // overdue
      },
      {
        name: "Khatabook",
        contactName: "Ravi",
        salesRep: "Rohit",
        salesRepEmail: "ujjwal@equitylist.co",
        phone: "+91 99887 76655",
        email: "ravi@khatabook.com",
        notes: "Sent pricing deck, wants to discuss today",
        lastContacted: dayOffset(-3),
        nextFollowUp: dayOffset(0), // due today
      },
      {
        name: "Zoho",
        contactName: "Priya",
        salesRep: "Priya",
        salesRepEmail: "priya@example.com",
        phone: "+91 90000 11111",
        email: "priya@zoho.com",
        notes: "Demo scheduled, follow up after trial",
        lastContacted: dayOffset(-1),
        nextFollowUp: dayOffset(3), // upcoming
      },
      {
        name: "Razorpay",
        contactName: "Karthik",
        salesRep: "Sana",
        salesRepEmail: "sana@example.com",
        phone: "+91 80000 22222",
        email: "karthik@razorpay.com",
        notes: "Interested, waiting on procurement",
        lastContacted: dayOffset(-5),
        nextFollowUp: dayOffset(7), // upcoming
      },
    ],
  });

  const count = await prisma.company.count();
  console.log(`Seeded ${count} companies.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
