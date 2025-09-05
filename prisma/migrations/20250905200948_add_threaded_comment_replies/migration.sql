-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "comments_postId_parentId_idx" ON "public"."comments"("postId", "parentId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
