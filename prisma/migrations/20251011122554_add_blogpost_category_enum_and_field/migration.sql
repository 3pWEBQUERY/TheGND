-- CreateEnum
CREATE TYPE "BlogCategory" AS ENUM ('AKTUELLES', 'INTERESSANT_HEISSES', 'VON_USER_FUER_USER');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "category" "BlogCategory" NOT NULL DEFAULT 'AKTUELLES';
