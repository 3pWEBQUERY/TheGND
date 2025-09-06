-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "deletionRequestMessage" TEXT,
ADD COLUMN     "deletionRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "editRequestMessage" TEXT,
ADD COLUMN     "editRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiddenByOwner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "targetUserId" TEXT,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "comments_targetUserId_idx" ON "public"."comments"("targetUserId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
