-- CreateTable
CREATE TABLE "GameAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameworldId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gamePlayerId" TEXT,

    CONSTRAINT "GameAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameAccount_userId_idx" ON "GameAccount"("userId");

-- CreateIndex
CREATE INDEX "GameAccount_gameworldId_idx" ON "GameAccount"("gameworldId");

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_userId_gameworldId_key" ON "GameAccount"("userId", "gameworldId");

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;
