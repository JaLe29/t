-- CreateTable
CREATE TABLE "GameworldRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameworldRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameworldRequest_userId_idx" ON "GameworldRequest"("userId");

-- CreateIndex
CREATE INDEX "GameworldRequest_status_idx" ON "GameworldRequest"("status");

-- CreateIndex
CREATE INDEX "GameworldRequest_name_idx" ON "GameworldRequest"("name");

-- AddForeignKey
ALTER TABLE "GameworldRequest" ADD CONSTRAINT "GameworldRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
