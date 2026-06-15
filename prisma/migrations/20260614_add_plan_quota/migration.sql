-- AlterTable
ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free',
                   ADD COLUMN "generationCount" INTEGER NOT NULL DEFAULT 0,
                   ADD COLUMN "generationMonth" TEXT NOT NULL DEFAULT '';
