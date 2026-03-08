-- AlterTable
ALTER TABLE "discovered_contacts" ADD COLUMN     "screenedAt" TIMESTAMP(3),
ADD COLUMN     "screeningReason" TEXT,
ADD COLUMN     "screeningStatus" TEXT NOT NULL DEFAULT 'pending';
