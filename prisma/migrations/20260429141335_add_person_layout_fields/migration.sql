-- AlterTable
ALTER TABLE "persons" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "PersonLayout" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "treeId" INTEGER NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,

    CONSTRAINT "PersonLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonLayout_personId_key" ON "PersonLayout"("personId");

-- AddForeignKey
ALTER TABLE "PersonLayout" ADD CONSTRAINT "PersonLayout_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
