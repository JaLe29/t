/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "lastUsedAt";

-- CreateTable
CREATE TABLE "GameAccountUnitRecord" (
    "id" TEXT NOT NULL,
    "gameAccountId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "units" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAccountUnitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameAccountUnitRecord_gameAccountId_idx" ON "GameAccountUnitRecord"("gameAccountId");

-- CreateIndex
CREATE INDEX "GameAccountUnitRecord_villageId_idx" ON "GameAccountUnitRecord"("villageId");

-- AddForeignKey
ALTER TABLE "GameAccountUnitRecord" ADD CONSTRAINT "GameAccountUnitRecord_gameAccountId_fkey" FOREIGN KEY ("gameAccountId") REFERENCES "GameAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
