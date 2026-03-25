-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nuid" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "program" TEXT,
    "gradYear" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nuid_key" ON "User"("nuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
