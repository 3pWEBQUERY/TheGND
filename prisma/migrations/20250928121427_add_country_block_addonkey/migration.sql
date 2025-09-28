-- CreateEnum
CREATE TYPE "public"."RentalCategory" AS ENUM ('APARTMENT', 'ROOM', 'STUDIO', 'EVENT_SPACE');

-- AlterEnum
ALTER TYPE "public"."addon_key" ADD VALUE 'COUNTRY_BLOCK';

-- CreateTable
CREATE TABLE "public"."rentals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."RentalCategory" NOT NULL,
    "location" TEXT,
    "city" TEXT,
    "country" TEXT,
    "priceInfo" TEXT,
    "contactInfo" TEXT,
    "media" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rentals_category_createdAt_idx" ON "public"."rentals"("category", "createdAt");

-- CreateIndex
CREATE INDEX "rentals_postedById_createdAt_idx" ON "public"."rentals"("postedById", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."rentals" ADD CONSTRAINT "rentals_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
