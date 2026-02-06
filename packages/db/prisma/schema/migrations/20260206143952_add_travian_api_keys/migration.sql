-- CreateTable
CREATE TABLE "TravianApiKeys" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT,
    "privateApiKey" TEXT,
    "gameworldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravianApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravianApiKeys_gameworldId_key" ON "TravianApiKeys"("gameworldId");

-- CreateIndex
CREATE INDEX "TravianApiKeys_gameworldId_idx" ON "TravianApiKeys"("gameworldId");

-- AddForeignKey
ALTER TABLE "TravianApiKeys" ADD CONSTRAINT "TravianApiKeys_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
