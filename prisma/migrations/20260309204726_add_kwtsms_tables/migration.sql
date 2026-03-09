-- CreateTable
CREATE TABLE "GatewayCredentials" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "senderId" TEXT NOT NULL DEFAULT '',
    "testMode" BOOLEAN NOT NULL DEFAULT true,
    "senderIds" TEXT NOT NULL DEFAULT '[]',
    "coverage" TEXT NOT NULL DEFAULT '[]',
    "balanceAvailable" REAL NOT NULL DEFAULT 0,
    "balancePurchased" REAL NOT NULL DEFAULT 0,
    "balanceUpdatedAt" DATETIME,
    "credentialsVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "templateEn" TEXT NOT NULL,
    "templateAr" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "msgId" TEXT,
    "pointsCharged" INTEGER NOT NULL DEFAULT 0,
    "balanceAfter" REAL,
    "errorCode" TEXT,
    "errorDescription" TEXT,
    "apiResponse" TEXT,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "GatewayCredentials_shop_key" ON "GatewayCredentials"("shop");

-- CreateIndex
CREATE INDEX "Settings_shop_idx" ON "Settings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_shop_key_key" ON "Settings"("shop", "key");

-- CreateIndex
CREATE INDEX "SmsTemplate_shop_idx" ON "SmsTemplate"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_shop_eventType_key" ON "SmsTemplate"("shop", "eventType");

-- CreateIndex
CREATE INDEX "SmsLog_shop_idx" ON "SmsLog"("shop");

-- CreateIndex
CREATE INDEX "SmsLog_createdAt_idx" ON "SmsLog"("createdAt");

-- CreateIndex
CREATE INDEX "SmsLog_shop_eventType_idx" ON "SmsLog"("shop", "eventType");
