import { prisma } from '@/lib/prisma'

// Basic level formula: +1 level every 1000 points, starting at level 1
function computeLevel(points: number): number {
  return Math.max(1, Math.floor(points / 1000) + 1)
}

const db: any = prisma

async function ensureDefaults() {
  try {
    // Models not yet on the hot process? skip silently
    if (!db?.badge?.upsert || !db?.perk?.upsert) return

    // Seed a minimal set of badges and perks if they don't exist yet
    // Badges
    await db.badge.upsert({
      where: { key: 'FIRST_POST' },
      update: {},
      create: {
        key: 'FIRST_POST',
        name: 'Erster Beitrag',
        description: 'Du hast deinen ersten Beitrag erstellt.',
        icon: '🔥',
        pointsReward: 50,
        active: true,
      },
    })
    await db.badge.upsert({
      where: { key: 'STREAK_3' },
      update: {},
      create: {
        key: 'STREAK_3',
        name: '3 Tage in Folge',
        description: 'An 3 aufeinanderfolgenden Tagen aktiv.',
        icon: '📅',
        pointsReward: 100,
        active: true,
      },
    })
    await db.badge.upsert({
      where: { key: 'STREAK_7' },
      update: {},
      create: {
        key: 'STREAK_7',
        name: '7 Tage in Folge',
        description: 'An 7 aufeinanderfolgenden Tagen aktiv.',
        icon: '🏆',
        pointsReward: 250,
        active: true,
      },
    })

    // Perks
    await db.perk.upsert({
      where: { key: 'BRONZE' },
      update: {},
      create: {
        key: 'BRONZE',
        name: 'Bronze Vorteil',
        description: 'Kleiner Bonus für aktive Nutzer.',
        thresholdPts: 500,
        active: true,
      },
    })
    await db.perk.upsert({
      where: { key: 'SILBER' },
      update: {},
      create: {
        key: 'SILBER',
        name: 'Silber Vorteil',
        description: 'Solider Bonus für engagierte Nutzer.',
        thresholdPts: 2000,
        active: true,
      },
    })
    await db.perk.upsert({
      where: { key: 'GOLD' },
      update: {},
      create: {
        key: 'GOLD',
        name: 'Gold Vorteil',
        description: 'Premium Bonus für Power-User.',
        thresholdPts: 5000,
        active: true,
      },
    })
  } catch {
    // ignore seeding errors; not critical
    return
  }
}

export async function ensureGamificationProfile(userId: string) {
  try {
    await ensureDefaults()
    const existing = await db.gamificationProfile.findUnique({ where: { userId } })
    if (existing) return existing
    return db.gamificationProfile.create({
      data: {
        userId,
        points: 0,
        level: 1,
        streakDays: 0,
        totalLogins: 0,
      },
    })
  } catch {
    // ignore profile creation errors; not critical
    return null
  }
  return db.gamificationProfile.create({
    data: {
      userId,
      points: 0,
      level: 1,
      streakDays: 0,
      totalLogins: 0,
    },
  })
}

async function awardBadgesForEvent(userId: string, type: string, profile: { streakDays: number }) {
  const toAward: string[] = []
  if (type === 'FEED_POST') {
    // Award FIRST_POST if user doesn't have it yet
    const has = await db.userBadge.findFirst({
      where: { userId, badge: { key: 'FIRST_POST' } },
    })
    if (!has) toAward.push('FIRST_POST')
  }
  if (profile.streakDays >= 3) {
    const has = await db.userBadge.findFirst({ where: { userId, badge: { key: 'STREAK_3' } } })
    if (!has) toAward.push('STREAK_3')
  }
  if (profile.streakDays >= 7) {
    const has7 = await db.userBadge.findFirst({ where: { userId, badge: { key: 'STREAK_7' } } })
    if (!has7) toAward.push('STREAK_7')
  }

  if (toAward.length > 0) {
    const badges = await db.badge.findMany({ where: { key: { in: toAward } } })
    for (const b of badges) {
      await db.userBadge.create({ data: { userId, badgeId: b.id } })
      if (b.pointsReward && b.pointsReward > 0) {
        await db.gamificationProfile.update({ where: { userId }, data: { points: { increment: b.pointsReward } } })
      }
    }
  }
}

async function unlockPerksIfEligible(userId: string) {
  const profile = await db.gamificationProfile.findUnique({ where: { userId } })
  if (!profile) return
  const perks = await db.perk.findMany({ where: { active: true, thresholdPts: { lte: profile.points } } })
  for (const p of perks) {
    const has = await db.userPerk.findFirst({ where: { userId, perkId: p.id } })
    if (!has) {
      await db.userPerk.create({ data: { userId, perkId: p.id } })
    }
  }
}

export async function awardEvent(userId: string, type: string, basePoints: number, metadata?: Record<string, any>) {
  // If models aren't ready in this hot process, skip gracefully
  if (!db?.gamificationEvent?.create || !db?.gamificationProfile?.update) {
    console.debug('[GAMIFICATION] awardEvent skipped – Prisma models not ready', { userId, type, basePoints })
    return
  }
  console.debug('[GAMIFICATION] awardEvent called', { userId, type, basePoints, metadata })
  try {
    await ensureGamificationProfile(userId)
    const metaStr = metadata ? JSON.stringify(metadata) : undefined

    // Record event
    const created = await db.gamificationEvent.create({
      data: {
        userId,
        type,
        points: basePoints,
        metadata: metaStr,
      },
    })
    console.debug('[GAMIFICATION] event created', { id: created.id, type: created.type, points: created.points })

    // Update profile points and level
    const updated = await db.gamificationProfile.update({
      where: { userId },
      data: {
        points: { increment: basePoints },
      },
    })

    const newLevel = computeLevel(updated.points)
    if (newLevel !== updated.level) {
      await db.gamificationProfile.update({ where: { userId }, data: { level: newLevel } })
      console.debug('[GAMIFICATION] level up', { userId, from: updated.level, to: newLevel })
    } else {
      console.debug('[GAMIFICATION] points updated (no level change)', { userId, points: updated.points, level: updated.level })
    }

    await awardBadgesForEvent(userId, type, updated)
    await unlockPerksIfEligible(userId)
    console.debug('[GAMIFICATION] post-award checks done', { userId })
  } catch (e) {
    console.error('[GAMIFICATION] awardEvent failed', { userId, type, basePoints, error: (e as any)?.message })
  }
}

export async function awardDailyLogin(userId: string) {
  if (!db?.gamificationEvent?.create || !db?.gamificationProfile?.update) {
    console.debug('[GAMIFICATION] awardDailyLogin skipped – Prisma models not ready', { userId })
    return
  }
  console.debug('[GAMIFICATION] awardDailyLogin called', { userId })
  const profile = await ensureGamificationProfile(userId)
  if (!profile) {
    console.error('[GAMIFICATION] awardDailyLogin aborted – no profile', { userId })
    return
  }
  const now = new Date()
  const last = profile.lastLoginAt ? new Date(profile.lastLoginAt) : null

  const isSameDay = last && last.toDateString() === now.toDateString()
  if (isSameDay) {
    // Already awarded today
    console.debug('[GAMIFICATION] daily login already awarded today', { userId, lastLoginAt: profile.lastLoginAt })
    return
  }

  // Calculate streak
  let newStreak = 1
  if (last) {
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) newStreak = profile.streakDays + 1
  }

  const base = 10
  const streakBonus = Math.min(newStreak * 2, 20) // up to +20
  const total = base + streakBonus
  console.debug('[GAMIFICATION] daily login compute', { userId, newStreak, base, streakBonus, total })

  await db.$transaction([
    db.gamificationEvent.create({
      data: {
        userId,
        type: 'DAILY_LOGIN',
        points: total,
        metadata: JSON.stringify({ streak: newStreak }),
      },
    }),
    db.gamificationProfile.update({
      where: { userId },
      data: {
        points: { increment: total },
        streakDays: newStreak,
        totalLogins: { increment: 1 },
        lastLoginAt: now,
      },
    }),
  ])
  console.debug('[GAMIFICATION] daily login stored', { userId, total })

  const updated = await db.gamificationProfile.findUnique({ where: { userId } })
  if (updated) {
    const level = computeLevel(updated.points)
    if (level !== updated.level) {
      await db.gamificationProfile.update({ where: { userId }, data: { level } })
      console.debug('[GAMIFICATION] daily login level up', { userId, from: updated.level, to: level })
    }
    await awardBadgesForEvent(userId, 'DAILY_LOGIN', updated)
    await unlockPerksIfEligible(userId)
    console.debug('[GAMIFICATION] daily login post-award checks done', { userId })
  }
}

export async function getGamificationOverview(userId: string) {
  // If Prisma Client isn't yet regenerated in this running process, return a safe default
  const modelsReady = (db as any)?.gamificationProfile && (db as any)?.gamificationEvent && (db as any)?.userBadge && (db as any)?.userPerk
  if (!modelsReady) {
    const profile = { points: 0, level: 1, streakDays: 0, totalLogins: 0 }
    return {
      profile,
      events: [],
      badges: [],
      perks: [],
      progress: {
        currentLevel: profile.level,
        nextLevel: profile.level + 1,
        toNextPoints: 1000,
        levelProgressPct: 0,
      },
    }
  }

  await ensureGamificationProfile(userId)
  const [profileRow, events, badges, perks, allPerks] = await Promise.all([
    db.gamificationProfile.findUnique({ where: { userId } }),
    db.gamificationEvent.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { awardedAt: 'desc' } }),
    db.userPerk.findMany({ where: { userId }, include: { perk: true }, orderBy: { unlockedAt: 'desc' } }),
    db.perk.findMany({ where: { active: true }, orderBy: { thresholdPts: 'asc' } }),
  ])

  const profile = profileRow ?? { points: 0, level: 1, streakDays: 0, totalLogins: 0 }
  const nextLevel = computeLevel(profile.points + (1000 - (profile.points % 1000)))
  const toNext = 1000 - (profile.points % 1000)

  // Derive badge-awarded events so the activity feed shows ALL sources of points
  const badgeEvents = badges.map((ub: any) => ({
    id: `badge-${ub.id}`,
    type: 'BADGE_AWARDED',
    points: ub?.badge?.pointsReward ?? 0,
    metadata: JSON.stringify({ badgeKey: ub?.badge?.key, badgeName: ub?.badge?.name }),
    createdAt: ub.awardedAt,
  }))

  // Derive perk-claimed events (no points, informative)
  const perkClaimedEvents = perks
    .filter((up: any) => !!up.claimedAt)
    .map((up: any) => ({
      id: `perk-claimed-${up.id}`,
      type: 'PERK_CLAIMED',
      points: 0,
      metadata: JSON.stringify({ perkKey: up?.perk?.key, perkName: up?.perk?.name }),
      createdAt: up.claimedAt as string,
    }))

  // Merge and sort by date desc
  const mergedEvents = [...events, ...badgeEvents, ...perkClaimedEvents].sort((a: any, b: any) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime())

  // Build a full perks list with unlocked/claimed flags so UI can render locked perks too
  const perksAll = allPerks.map((p: any) => {
    const up = (perks as any[]).find((it: any) => it.perk?.id === p.id)
    return {
      id: p.id,
      key: p.key,
      name: p.name,
      description: p.description,
      thresholdPts: p.thresholdPts,
      unlocked: !!up,
      unlockedAt: up?.unlockedAt ?? null,
      claimedAt: up?.claimedAt ?? null,
    }
  })

  return {
    profile,
    events: mergedEvents,
    badges,
    perks,
    perksAll,
    progress: {
      currentLevel: profile.level,
      nextLevel: nextLevel,
      toNextPoints: toNext === 1000 ? 0 : toNext,
      levelProgressPct: ((profile.points % 1000) / 1000) * 100,
    },
  }
}
