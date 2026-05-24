-- CreateEnum
CREATE TYPE "TreePermissions" AS ENUM ('VIEW', 'ADD_PERSON', 'MEDIA_ONLY', 'EDIT_OWN');

-- AlterTable
ALTER TABLE "persons" ADD COLUMN     "created_by_member_id" TEXT;

-- CreateTable
CREATE TABLE "tree_share_tokens" (
    "id" TEXT NOT NULL,
    "tree_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "token" TEXT NOT NULL,
    "permission" "TreePermissions" NOT NULL,
    "person_limit" INTEGER,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tree_share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tree_share_members" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "added_persons_count" INTEGER NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tree_share_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tree_share_tokens_token_key" ON "tree_share_tokens"("token");

-- CreateIndex
CREATE INDEX "tree_share_tokens_token_idx" ON "tree_share_tokens"("token");

-- CreateIndex
CREATE INDEX "tree_share_tokens_tree_id_idx" ON "tree_share_tokens"("tree_id");

-- CreateIndex
CREATE INDEX "tree_share_members_token_id_idx" ON "tree_share_members"("token_id");

-- CreateIndex
CREATE INDEX "tree_share_members_user_id_idx" ON "tree_share_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tree_share_members_token_id_user_id_key" ON "tree_share_members"("token_id", "user_id");

-- AddForeignKey
ALTER TABLE "tree_share_tokens" ADD CONSTRAINT "tree_share_tokens_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_share_tokens" ADD CONSTRAINT "tree_share_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_share_members" ADD CONSTRAINT "tree_share_members_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tree_share_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tree_share_members" ADD CONSTRAINT "tree_share_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_created_by_member_id_fkey" FOREIGN KEY ("created_by_member_id") REFERENCES "tree_share_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
