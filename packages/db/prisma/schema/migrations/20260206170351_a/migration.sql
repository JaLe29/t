-- AlterTable
ALTER TABLE "ScrapeItem" ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ScrapeItem_isProcessed_idx" ON "ScrapeItem"("isProcessed");
