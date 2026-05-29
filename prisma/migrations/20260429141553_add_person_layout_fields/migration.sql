/*
  Warnings:

  - You are about to drop the `PersonLayout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonLayout" DROP CONSTRAINT "PersonLayout_personId_fkey";

-- DropTable
DROP TABLE "PersonLayout";

-- CreateTable
CREATE TABLE "person_layout" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "treeId" INTEGER NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,

    CONSTRAINT "person_layout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_layout_personId_key" ON "person_layout"("personId");

-- AddForeignKey
ALTER TABLE "person_layout" ADD CONSTRAINT "person_layout_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
