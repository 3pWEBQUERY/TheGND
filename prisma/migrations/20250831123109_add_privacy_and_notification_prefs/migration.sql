-- CreateEnum
CREATE TYPE "public"."ProfileVisibility" AS ENUM ('PUBLIC', 'VERIFIED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."NotificationPreference" AS ENUM ('ALL', 'IMPORTANT', 'NONE');

-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "notificationPreference" "public"."NotificationPreference" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "visibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PUBLIC';
