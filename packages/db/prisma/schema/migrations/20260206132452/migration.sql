-- AlterTable
ALTER TABLE "Gameworld" ADD COLUMN     "date" INTEGER,
ADD COLUMN     "landscapes" JSONB,
ADD COLUMN     "lastUpdateTime" INTEGER;

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tribeId" TEXT,
    "kingdomId" TEXT,
    "treasures" INTEGER NOT NULL DEFAULT 0,
    "role" INTEGER NOT NULL DEFAULT 0,
    "externalLoginToken" TEXT,
    "gameworldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "population" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isMainVillage" BOOLEAN NOT NULL DEFAULT false,
    "isCity" BOOLEAN NOT NULL DEFAULT false,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapCell" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "resType" TEXT,
    "oasis" TEXT,
    "landscape" TEXT NOT NULL,
    "kingdomId" INTEGER NOT NULL DEFAULT 0,
    "gameworldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_gameworldId_idx" ON "Player"("gameworldId");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Player_tribeId_idx" ON "Player"("tribeId");

-- CreateIndex
CREATE INDEX "Player_kingdomId_idx" ON "Player"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerId_gameworldId_key" ON "Player"("playerId", "gameworldId");

-- CreateIndex
CREATE INDEX "Village_playerId_idx" ON "Village"("playerId");

-- CreateIndex
CREATE INDEX "Village_x_y_idx" ON "Village"("x", "y");

-- CreateIndex
CREATE INDEX "Village_name_idx" ON "Village"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Village_villageId_playerId_key" ON "Village"("villageId", "playerId");

-- CreateIndex
CREATE INDEX "MapCell_gameworldId_idx" ON "MapCell"("gameworldId");

-- CreateIndex
CREATE INDEX "MapCell_x_y_idx" ON "MapCell"("x", "y");

-- CreateIndex
CREATE INDEX "MapCell_kingdomId_idx" ON "MapCell"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "MapCell_cellId_gameworldId_key" ON "MapCell"("cellId", "gameworldId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapCell" ADD CONSTRAINT "MapCell_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
