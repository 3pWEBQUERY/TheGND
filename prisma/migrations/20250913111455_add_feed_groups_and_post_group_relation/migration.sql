-- CreateEnum
CREATE TYPE "public"."GroupPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."GroupRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "public"."posts" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "public"."feed_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "privacy" "public"."GroupPrivacy" NOT NULL DEFAULT 'PUBLIC',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feed_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."GroupRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_groups_slug_key" ON "public"."feed_groups"("slug");

-- CreateIndex
CREATE INDEX "feed_groups_ownerId_idx" ON "public"."feed_groups"("ownerId");

-- CreateIndex
CREATE INDEX "feed_group_members_userId_idx" ON "public"."feed_group_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "feed_group_members_groupId_userId_key" ON "public"."feed_group_members"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "public"."feed_groups" ADD CONSTRAINT "feed_groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feed_group_members" ADD CONSTRAINT "feed_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."feed_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feed_group_members" ADD CONSTRAINT "feed_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."feed_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
