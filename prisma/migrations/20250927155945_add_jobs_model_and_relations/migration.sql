-- CreateEnum
CREATE TYPE "public"."JobCategory" AS ENUM ('ESCORT', 'CLEANING', 'SECURITY', 'HOUSEKEEPING');

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."JobCategory" NOT NULL,
    "location" TEXT,
    "city" TEXT,
    "country" TEXT,
    "salaryInfo" TEXT,
    "contactInfo" TEXT,
    "media" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_category_createdAt_idx" ON "public"."jobs"("category", "createdAt");

-- CreateIndex
CREATE INDEX "jobs_postedById_createdAt_idx" ON "public"."jobs"("postedById", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
