-- AlterTable
ALTER TABLE "AvailabilitySlot" ADD COLUMN     "booked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "slotId" TEXT;

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "email" TEXT;
