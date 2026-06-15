-- CreateTable
CREATE TABLE "BrandVoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Ma voix',
    "samples" TEXT NOT NULL,
    "profile" TEXT,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BrandVoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandVoice_userId_idx" ON "BrandVoice"("userId");

-- AddForeignKey
ALTER TABLE "BrandVoice" ADD CONSTRAINT "BrandVoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Generation" ADD COLUMN "brandVoiceId" TEXT;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_brandVoiceId_fkey" FOREIGN KEY ("brandVoiceId") REFERENCES "BrandVoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
