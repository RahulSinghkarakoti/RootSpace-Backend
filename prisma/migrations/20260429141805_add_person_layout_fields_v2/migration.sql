/*
  Warnings:

  - You are about to drop the column `personId` on the `person_layout` table. All the data in the column will be lost.
  - You are about to drop the column `treeId` on the `person_layout` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[person_id]` on the table `person_layout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `person_id` to the `person_layout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tree_id` to the `person_layout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "person_layout" DROP CONSTRAINT "person_layout_personId_fkey";

-- DropIndex
DROP INDEX "person_layout_personId_key";

-- AlterTable
ALTER TABLE "person_layout" DROP COLUMN "personId",
DROP COLUMN "treeId",
ADD COLUMN     "person_id" TEXT NOT NULL,
ADD COLUMN     "tree_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "person_layout_person_id_key" ON "person_layout"("person_id");

-- AddForeignKey
ALTER TABLE "person_layout" ADD CONSTRAINT "person_layout_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
