-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "salesRep" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "lastContacted" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "note" TEXT,
    "nextFollowUp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_nextFollowUp_idx" ON "Company"("nextFollowUp");

-- CreateIndex
CREATE INDEX "Company_salesRep_idx" ON "Company"("salesRep");

-- CreateIndex
CREATE INDEX "CallLog_companyId_idx" ON "CallLog"("companyId");

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
