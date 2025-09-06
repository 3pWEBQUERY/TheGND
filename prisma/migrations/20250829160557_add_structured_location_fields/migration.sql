-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationFormatted" TEXT,
ADD COLUMN     "locationPlaceId" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "profiles_latitude_longitude_idx" ON "public"."profiles"("latitude", "longitude");
