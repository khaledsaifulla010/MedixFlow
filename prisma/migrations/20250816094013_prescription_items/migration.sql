/*
  Warnings:

  - You are about to drop the column `dosage` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `dosageTime` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Prescription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Prescription" DROP COLUMN "dosage",
DROP COLUMN "dosageTime",
DROP COLUMN "duration",
DROP COLUMN "name",
DROP COLUMN "type";

-- CreateTable
CREATE TABLE "public"."PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "dosageTime" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
