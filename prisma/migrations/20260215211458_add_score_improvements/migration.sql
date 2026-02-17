-- CreateEnum
CREATE TYPE "ImprovementStatus" AS ENUM ('PENDING', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE "ScoreImprovement" (
    "id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetDimensions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedImpact" INTEGER NOT NULL,
    "status" "ImprovementStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreImprovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoreImprovement_ideaId_idx" ON "ScoreImprovement"("ideaId");

-- AddForeignKey
ALTER TABLE "ScoreImprovement" ADD CONSTRAINT "ScoreImprovement_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
