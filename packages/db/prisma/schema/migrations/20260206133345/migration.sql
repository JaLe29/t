-- AlterTable
ALTER TABLE "Gameworld" ADD COLUMN     "isDryRun" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Gameworld_isDryRun_idx" ON "Gameworld"("isDryRun");
