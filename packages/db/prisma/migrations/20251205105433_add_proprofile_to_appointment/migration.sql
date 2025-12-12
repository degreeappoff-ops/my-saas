/*
  Warnings:

  - You are about to drop the column `note` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `proId` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `proProfileId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `slotId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_proId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_slotId_fkey";

-- DropIndex
DROP INDEX "public"."idx_appt_pro";

-- DropIndex
DROP INDEX "public"."idx_appt_status";

-- DropIndex
DROP INDEX "public"."idx_appt_user";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "note",
DROP COLUMN "proId",
ADD COLUMN     "proProfileId" TEXT NOT NULL,
ALTER COLUMN "slotId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_proProfileId_fkey" FOREIGN KEY ("proProfileId") REFERENCES "ProProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
