/*
  Warnings:

  - You are about to drop the column `date` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `DoctorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."DoctorProfile" DROP COLUMN "date",
DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "isRecurring",
DROP COLUMN "startTime";

-- CreateTable
CREATE TABLE "public"."DoctorAvailability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "dayOfWeek" INTEGER,
    "date" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
