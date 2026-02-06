-- CreateTable
CREATE TABLE "FailedLoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
    "scrapeItemId" TEXT NOT NULL,
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
    "scrapeItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FailedLoginAttempt_email_idx" ON "FailedLoginAttempt"("email");

-- CreateIndex
CREATE INDEX "FailedLoginAttempt_ipAddress_idx" ON "FailedLoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "FailedLoginAttempt_createdAt_idx" ON "FailedLoginAttempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Gameworld_name_key" ON "Gameworld"("name");

-- CreateIndex
CREATE INDEX "Gameworld_name_idx" ON "Gameworld"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TravianApiKeys_gameworldId_key" ON "TravianApiKeys"("gameworldId");

-- CreateIndex
CREATE INDEX "TravianApiKeys_gameworldId_idx" ON "TravianApiKeys"("gameworldId");

-- CreateIndex
CREATE INDEX "ScrapeItem_gameworldId_idx" ON "ScrapeItem"("gameworldId");

-- CreateIndex
CREATE INDEX "ScrapeItem_isDryRun_idx" ON "ScrapeItem"("isDryRun");

-- CreateIndex
CREATE INDEX "ScrapeItem_date_idx" ON "ScrapeItem"("date");

-- CreateIndex
CREATE INDEX "Player_scrapeItemId_idx" ON "Player"("scrapeItemId");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Player_tribeId_idx" ON "Player"("tribeId");

-- CreateIndex
CREATE INDEX "Player_kingdomId_idx" ON "Player"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_playerId_scrapeItemId_key" ON "Player"("playerId", "scrapeItemId");

-- CreateIndex
CREATE INDEX "Village_playerId_idx" ON "Village"("playerId");

-- CreateIndex
CREATE INDEX "Village_x_y_idx" ON "Village"("x", "y");

-- CreateIndex
CREATE INDEX "Village_name_idx" ON "Village"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Village_villageId_playerId_key" ON "Village"("villageId", "playerId");

-- CreateIndex
CREATE INDEX "MapCell_scrapeItemId_idx" ON "MapCell"("scrapeItemId");

-- CreateIndex
CREATE INDEX "MapCell_x_y_idx" ON "MapCell"("x", "y");

-- CreateIndex
CREATE INDEX "MapCell_kingdomId_idx" ON "MapCell"("kingdomId");

-- CreateIndex
CREATE UNIQUE INDEX "MapCell_cellId_scrapeItemId_key" ON "MapCell"("cellId", "scrapeItemId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravianApiKeys" ADD CONSTRAINT "TravianApiKeys_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeItem" ADD CONSTRAINT "ScrapeItem_gameworldId_fkey" FOREIGN KEY ("gameworldId") REFERENCES "Gameworld"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_scrapeItemId_fkey" FOREIGN KEY ("scrapeItemId") REFERENCES "ScrapeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapCell" ADD CONSTRAINT "MapCell_scrapeItemId_fkey" FOREIGN KEY ("scrapeItemId") REFERENCES "ScrapeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
