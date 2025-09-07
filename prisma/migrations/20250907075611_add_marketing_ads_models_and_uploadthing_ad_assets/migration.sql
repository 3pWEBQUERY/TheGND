-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."membership_plan_key" AS ENUM ('BASIS', 'PLUS', 'PREMIUM');

-- CreateEnum
CREATE TYPE "public"."addon_key" AS ENUM ('ESCORT_OF_DAY', 'ESCORT_OF_WEEK', 'ESCORT_OF_MONTH', 'CITY_BOOST');

-- CreateEnum
CREATE TYPE "public"."membership_status" AS ENUM ('ACTIVE', 'CANCELED', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."booking_status" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."MarketingPlacementKey" AS ENUM ('HOME_BANNER', 'HOME_TILE', 'RESULTS_TOP', 'SIDEBAR', 'SPONSORED_POST');

-- CreateEnum
CREATE TYPE "public"."MarketingOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "rating" INTEGER;

-- CreateTable
CREATE TABLE "public"."verification_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "idNumber" TEXT NOT NULL,
    "idPhotoUrl" TEXT NOT NULL,
    "selfiePhotoUrl" TEXT NOT NULL,
    "idVideoUrl" TEXT,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_plans" (
    "id" TEXT NOT NULL,
    "key" "public"."membership_plan_key" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "features" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addons" (
    "id" TEXT NOT NULL,
    "key" "public"."addon_key" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."addon_options" (
    "id" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addon_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."membership_status" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_addon_bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addonOptionId" TEXT NOT NULL,
    "status" "public"."booking_status" NOT NULL DEFAULT 'PENDING',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addon_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."marketing_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."MarketingOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "placementKey" "public"."MarketingPlacementKey" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_assets" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_requests_userId_status_idx" ON "public"."verification_requests"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_key_key" ON "public"."membership_plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "addons_key_key" ON "public"."addons"("key");

-- CreateIndex
CREATE UNIQUE INDEX "addon_options_addonId_durationDays_key" ON "public"."addon_options"("addonId", "durationDays");

-- CreateIndex
CREATE INDEX "user_memberships_userId_status_idx" ON "public"."user_memberships"("userId", "status");

-- CreateIndex
CREATE INDEX "user_addon_bookings_userId_status_idx" ON "public"."user_addon_bookings"("userId", "status");

-- CreateIndex
CREATE INDEX "marketing_orders_userId_status_idx" ON "public"."marketing_orders"("userId", "status");

-- CreateIndex
CREATE INDEX "marketing_order_items_orderId_placementKey_idx" ON "public"."marketing_order_items"("orderId", "placementKey");

-- CreateIndex
CREATE INDEX "marketing_assets_orderItemId_idx" ON "public"."marketing_assets"("orderItemId");

-- AddForeignKey
ALTER TABLE "public"."verification_requests" ADD CONSTRAINT "verification_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_requests" ADD CONSTRAINT "verification_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."addon_options" ADD CONSTRAINT "addon_options_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "public"."addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_memberships" ADD CONSTRAINT "user_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_memberships" ADD CONSTRAINT "user_memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_addon_bookings" ADD CONSTRAINT "user_addon_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_addon_bookings" ADD CONSTRAINT "user_addon_bookings_addonOptionId_fkey" FOREIGN KEY ("addonOptionId") REFERENCES "public"."addon_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_orders" ADD CONSTRAINT "marketing_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_order_items" ADD CONSTRAINT "marketing_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."marketing_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_assets" ADD CONSTRAINT "marketing_assets_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."marketing_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
