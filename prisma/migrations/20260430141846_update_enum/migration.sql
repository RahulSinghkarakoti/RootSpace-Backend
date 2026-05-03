/*
  Warnings:

  - The values [FATHER_OF,MOTHER_OF,CHILD_OF,HUSBAND_OF,WIFE_OF,PARTNER_OF] on the enum `RelationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RelationType_new" AS ENUM ('PARENT_OF', 'SPOUSE_OF', 'SIBLING_OF');
ALTER TABLE "relations" ALTER COLUMN "type" TYPE "RelationType_new" USING ("type"::text::"RelationType_new");
ALTER TYPE "RelationType" RENAME TO "RelationType_old";
ALTER TYPE "RelationType_new" RENAME TO "RelationType";
DROP TYPE "public"."RelationType_old";
COMMIT;
