/*
  Warnings:

  - Added the required column `phone` to the `MeetingParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN     "phone" TEXT NOT NULL;
