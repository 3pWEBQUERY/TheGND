-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GamificationEventType" ADD VALUE 'FORUM_THREAD';
ALTER TYPE "GamificationEventType" ADD VALUE 'FORUM_THREAD_CLOSE';
ALTER TYPE "GamificationEventType" ADD VALUE 'FORUM_THREAD_OPEN';
ALTER TYPE "GamificationEventType" ADD VALUE 'BLOG_POST';
ALTER TYPE "GamificationEventType" ADD VALUE 'BLOG_PUBLISH';
ALTER TYPE "GamificationEventType" ADD VALUE 'BLOG_UPDATE_MAJOR';
