-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'APPLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "TreeType" AS ENUM ('FAMILY', 'EDUCATIONAL');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('FATHER_OF', 'MOTHER_OF', 'CHILD_OF', 'HUSBAND_OF', 'WIFE_OF', 'PARTNER_OF', 'SIBLING_OF');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trees" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover_image" TEXT,
    "member_count" INTEGER DEFAULT 0,
    "created_by" TEXT,
    "type" "TreeType" NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "tree_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_entries" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "degree_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "person_id" TEXT,
    "tree_id" INTEGER,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "caption" TEXT,
    "type" TEXT NOT NULL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relations" (
    "id" TEXT NOT NULL,
    "tree_id" INTEGER NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_providers" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "trees_slug_key" ON "trees"("slug");

-- CreateIndex
CREATE INDEX "trees_slug_idx" ON "trees"("slug");

-- CreateIndex
CREATE INDEX "trees_created_by_idx" ON "trees"("created_by");

-- CreateIndex
CREATE INDEX "trees_name_idx" ON "trees"("name");

-- CreateIndex
CREATE INDEX "persons_tree_id_idx" ON "persons"("tree_id");

-- CreateIndex
CREATE INDEX "persons_fullName_idx" ON "persons"("fullName");

-- CreateIndex
CREATE INDEX "persons_birthDate_idx" ON "persons"("birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "persons_tree_id_slug_key" ON "persons"("tree_id", "slug");

-- CreateIndex
CREATE INDEX "education_entries_person_id_idx" ON "education_entries"("person_id");

-- CreateIndex
CREATE INDEX "education_entries_startDate_idx" ON "education_entries"("startDate");

-- CreateIndex
CREATE INDEX "education_entries_institution_idx" ON "education_entries"("institution");

-- CreateIndex
CREATE INDEX "media_person_id_idx" ON "media"("person_id");

-- CreateIndex
CREATE INDEX "media_tree_id_idx" ON "media"("tree_id");

-- CreateIndex
CREATE INDEX "media_order_idx" ON "media"("order");

-- CreateIndex
CREATE INDEX "relations_tree_id_from_id_idx" ON "relations"("tree_id", "from_id");

-- CreateIndex
CREATE INDEX "relations_tree_id_to_id_idx" ON "relations"("tree_id", "to_id");

-- CreateIndex
CREATE INDEX "relations_type_idx" ON "relations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "relations_tree_id_from_id_to_id_type_key" ON "relations"("tree_id", "from_id", "to_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_provider_provider_id_key" ON "oauth_providers"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "email_verifications_token_hash_idx" ON "email_verifications"("token_hash");

-- CreateIndex
CREATE INDEX "password_resets_token_hash_idx" ON "password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "trees" ADD CONSTRAINT "trees_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_entries" ADD CONSTRAINT "education_entries_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
