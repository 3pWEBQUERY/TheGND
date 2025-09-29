-- CreateEnum
CREATE TYPE "public"."FeedbackReason" AS ENUM ('REPORT_AD', 'BUG', 'PRAISE', 'ADVERTISING', 'CUSTOMER_SERVICE', 'OTHER');

-- AlterTable
ALTER TABLE "public"."feedback" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "customTitle" TEXT,
ADD COLUMN     "reason" "public"."FeedbackReason";

-- CreateIndex
CREATE INDEX "feedback_reason_idx" ON "public"."feedback"("reason");
