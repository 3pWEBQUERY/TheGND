-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "reviewTicketId" TEXT,
ADD COLUMN     "verifiedByTicket" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."review_tickets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "redeemedById" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_tickets_code_key" ON "public"."review_tickets"("code");

-- CreateIndex
CREATE INDEX "review_tickets_targetUserId_idx" ON "public"."review_tickets"("targetUserId");

-- CreateIndex
CREATE INDEX "review_tickets_issuedById_idx" ON "public"."review_tickets"("issuedById");

-- CreateIndex
CREATE INDEX "review_tickets_redeemedById_idx" ON "public"."review_tickets"("redeemedById");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_reviewTicketId_fkey" FOREIGN KEY ("reviewTicketId") REFERENCES "public"."review_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_tickets" ADD CONSTRAINT "review_tickets_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_tickets" ADD CONSTRAINT "review_tickets_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_tickets" ADD CONSTRAINT "review_tickets_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
