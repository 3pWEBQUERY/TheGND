-- CreateEnum
CREATE TYPE "public"."MarketingAssetStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."marketing_assets" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."MarketingAssetStatus" NOT NULL DEFAULT 'PENDING';
