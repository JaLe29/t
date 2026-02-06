-- CreateTable
CREATE TABLE "ScrapeItem" (
    "id" TEXT NOT NULL,
    "lastUpdateTime" INTEGER,
    "date" INTEGER,
    "landscapes" JSONB,
    "isDryRun" BOOLEAN NOT NULL DEFAULT false,
    "gameworldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeItem_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Gameworld" DROP COLUMN "date",
DROP COLUMN "landscapes",
DROP COLUMN "lastUpdateTime",
DROP COLUMN "isDryRun";

-- AlterTable
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameworldId_fkey",
ADD COLUMN "scrapeItemId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "MapCell" DROP CONSTRAINT "MapCell_gameworldId_fkey",
ADD COLUMN "scrapeItemId" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "ScrapeItem_gameworldId_idx" ON "ScrapeItem"("gameworldId");

-- CreateIndex
CREATE INDEX "ScrapeItem_isDryRun_idx" ON "ScrapeItem"("isDryRun");

-- CreateIndex
CREATE INDEX "ScrapeItem_date_idx" ON "ScrapeItem"("date");

-- DropIndex
DROP INDEX "Player_gameworldId_idx";

-- DropIndex
DROP INDEX "MapCell_gameworldId_idx";

-- DropIndex
DROP INDEX "Gameworld_isDryRun_idx";

-- DropIndex
DROP INDEX "Player_playerId_gameworldId_key";

-- DropIndex
DROP INDEX "MapCell_cellId_gameworldId_key";

-- CreateIndex
CREATE INDEX "Player_scrapeItemId_idx" ON "Player"("scrapeItemId");

-- CreateIndex
CREATE INDEX "MapCell_scrapeItemId_idx" ON "MapCell"("scrapeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerId_scrapeItemId_key" ON "Player"("playerId", "scrapeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "MapCell_cellId_scrapeItemId_key" ON "MapCell"("cellId", "scrapeItemId");

-- AddForeignKey
ALTER TABLE "ScrapeItem" ADD CONSTRAINT "ScrapeItem_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_scrapeItemId_fkey" FOREIGN KEY ("scrapeItemId") REFERENCES "ScrapeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapCell" ADD CONSTRAINT "MapCell_scrapeItemId_fkey" FOREIGN KEY ("scrapeItemId") REFERENCES "ScrapeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "gameworldId";

-- AlterTable
ALTER TABLE "MapCell" DROP COLUMN "gameworldId";
