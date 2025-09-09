-- CreateEnum
CREATE TYPE "public"."ProfileView" AS ENUM ('STANDARD', 'ALT1', 'ALT2');

-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "profileView" "public"."ProfileView" NOT NULL DEFAULT 'STANDARD';
