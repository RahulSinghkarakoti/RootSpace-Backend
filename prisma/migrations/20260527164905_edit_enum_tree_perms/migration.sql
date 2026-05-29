/*
  Warnings:

  - The values [VIEW,EDIT_OWN] on the enum `TreePermissions` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TreePermissions_new" AS ENUM ('VIEW_ONLY', 'MEDIA_ONLY', 'ADD_PERSON', 'CONTRIBUTOR', 'EDITOR', 'FULL_ACCESS');
ALTER TABLE "tree_share_tokens" ALTER COLUMN "permission" TYPE "TreePermissions_new" USING ("permission"::text::"TreePermissions_new");
ALTER TYPE "TreePermissions" RENAME TO "TreePermissions_old";
ALTER TYPE "TreePermissions_new" RENAME TO "TreePermissions";
DROP TYPE "public"."TreePermissions_old";
COMMIT;
