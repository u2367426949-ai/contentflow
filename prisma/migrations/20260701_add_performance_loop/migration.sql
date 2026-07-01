-- AlterTable: publish result + engagement metrics on scheduled posts
ALTER TABLE "ScheduledPost" ADD COLUMN "externalId" TEXT;
ALTER TABLE "ScheduledPost" ADD COLUMN "impressions" INTEGER;
ALTER TABLE "ScheduledPost" ADD COLUMN "likes" INTEGER;
ALTER TABLE "ScheduledPost" ADD COLUMN "comments" INTEGER;
ALTER TABLE "ScheduledPost" ADD COLUMN "shares" INTEGER;
ALTER TABLE "ScheduledPost" ADD COLUMN "metricsAt" TIMESTAMP(3);

-- CreateTable: per-user, per-platform AI performance insight
CREATE TABLE "PerformanceInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PerformanceInsight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PerformanceInsight_userId_platform_key" ON "PerformanceInsight"("userId", "platform");

ALTER TABLE "PerformanceInsight" ADD CONSTRAINT "PerformanceInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
