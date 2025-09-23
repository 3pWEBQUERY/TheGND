-- CreateEnum
CREATE TYPE "public"."MatchActionType" AS ENUM ('LIKE', 'PASS');

-- AlterEnum
ALTER TYPE "public"."addon_key" ADD VALUE 'PROFILE_ANALYTICS';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."profile_visits" (
    "id" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "visitorId" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_addon_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" "public"."addon_key" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addon_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_analytics_events" (
    "id" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "durationMs" INTEGER,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_match_actions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "action" "public"."MatchActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_match_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_visits_profileUserId_visitedAt_idx" ON "public"."profile_visits"("profileUserId", "visitedAt");

-- CreateIndex
CREATE INDEX "profile_visits_visitorId_visitedAt_idx" ON "public"."profile_visits"("visitorId", "visitedAt");

-- CreateIndex
CREATE INDEX "user_addon_states_userId_key_idx" ON "public"."user_addon_states"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "user_addon_states_userId_key_key" ON "public"."user_addon_states"("userId", "key");

-- CreateIndex
CREATE INDEX "profile_analytics_events_profileUserId_createdAt_idx" ON "public"."profile_analytics_events"("profileUserId", "createdAt");

-- CreateIndex
CREATE INDEX "profile_analytics_events_visitorId_createdAt_idx" ON "public"."profile_analytics_events"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "profile_analytics_events_sessionId_type_idx" ON "public"."profile_analytics_events"("sessionId", "type");

-- CreateIndex
CREATE INDEX "member_match_actions_memberId_idx" ON "public"."member_match_actions"("memberId");

-- CreateIndex
CREATE INDEX "member_match_actions_escortId_idx" ON "public"."member_match_actions"("escortId");

-- CreateIndex
CREATE UNIQUE INDEX "member_match_actions_memberId_escortId_key" ON "public"."member_match_actions"("memberId", "escortId");

-- AddForeignKey
ALTER TABLE "public"."profile_visits" ADD CONSTRAINT "profile_visits_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_visits" ADD CONSTRAINT "profile_visits_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_addon_states" ADD CONSTRAINT "user_addon_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_analytics_events" ADD CONSTRAINT "profile_analytics_events_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_analytics_events" ADD CONSTRAINT "profile_analytics_events_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_match_actions" ADD CONSTRAINT "member_match_actions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_match_actions" ADD CONSTRAINT "member_match_actions_escortId_fkey" FOREIGN KEY ("escortId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
