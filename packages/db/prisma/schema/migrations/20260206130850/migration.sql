-- CreateTable
CREATE TABLE "Gameworld" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "speedTroops" DOUBLE PRECISION NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gameworld_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gameworld_name_key" ON "Gameworld"("name");

-- CreateIndex
CREATE INDEX "Gameworld_name_idx" ON "Gameworld"("name");
