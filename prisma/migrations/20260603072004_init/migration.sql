/*
  Warnings:

  - A unique constraint covering the columns `[name,domain]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domain` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "domain" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_domain_key" ON "permissions"("name", "domain");
