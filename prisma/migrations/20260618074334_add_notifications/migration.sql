-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "salesRepEmail" TEXT;

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "repEmail" TEXT NOT NULL,
    "sentForDate" TIMESTAMP(3) NOT NULL,
    "companyCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_repEmail_sentForDate_key" ON "NotificationLog"("repEmail", "sentForDate");
