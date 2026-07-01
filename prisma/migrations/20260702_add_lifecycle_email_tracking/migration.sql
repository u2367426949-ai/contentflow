-- AlterTable: dedup timestamps for lifecycle emails
ALTER TABLE "User" ADD COLUMN "activationEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "quotaWarningEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastDigestEmailAt" TIMESTAMP(3);
