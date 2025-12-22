-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateTable
CREATE TABLE "ProWorkingHours" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "proId" TEXT NOT NULL,
    "day" "Weekday" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "startMin" INTEGER NOT NULL DEFAULT 540,
    "endMin" INTEGER NOT NULL DEFAULT 1080,

    CONSTRAINT "ProWorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_workhours_pro" ON "ProWorkingHours"("proId");

-- CreateIndex
CREATE UNIQUE INDEX "ProWorkingHours_proId_day_key" ON "ProWorkingHours"("proId", "day");

-- AddForeignKey
ALTER TABLE "ProWorkingHours" ADD CONSTRAINT "ProWorkingHours_proId_fkey" FOREIGN KEY ("proId") REFERENCES "ProProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
