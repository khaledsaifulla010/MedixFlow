-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'doctor', 'patient');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "role" "public"."Role" NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientProfile" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergies" TEXT,
    "pastTreatments" TEXT,
    "files" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_patientId_key" ON "public"."PatientProfile"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "public"."PatientProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("patientId") ON DELETE RESTRICT ON UPDATE CASCADE;
