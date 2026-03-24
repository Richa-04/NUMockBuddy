-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "totalFillers" INTEGER NOT NULL DEFAULT 0,
    "totalRepeated" INTEGER NOT NULL DEFAULT 0,
    "eyeContact" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "engagement" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);
