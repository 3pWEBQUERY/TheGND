import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    if (session.user.userType !== 'MEMBER') return NextResponse.json({ error: 'Nur für Mitglieder' }, { status: 403 })

    const url = new URL(req.url)
    const limit = Math.min(50, Math.max(5, Number(url.searchParams.get('limit') || 20)))

    // Load member preferences JSON (stored on Profile.preferences)
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    })

    const pref = parseJSON<any>(me?.profile?.preferences ?? null, {})
    const preferredServices: string[] = Array.isArray(pref.services) ? pref.services.map((s: any) => String(s).toLowerCase()) : []
    const preferredCity = typeof pref.city === 'string' ? pref.city : undefined
    const preferredCountry = typeof pref.country === 'string' ? pref.country : undefined
    const preferredAppearance: Record<string, string | string[] | undefined> = pref.appearance || {}
    const preferredLanguages: string[] = Array.isArray(pref.languages) ? pref.languages.map((l: any) => String(l).toLowerCase()) : []
    const preferredPiercings: string[] = Array.isArray(pref.piercings) ? pref.piercings.map((v: any) => String(v).toLowerCase()) : []
    const preferredTattoos: string[] = Array.isArray(pref.tattoos) ? pref.tattoos.map((v: any) => String(v).toLowerCase()) : []

    // Exclude escorts already swiped (use raw SQL to avoid local Prisma client mismatch)
    let excludeIds: string[] = []
    try {
      const rows = await prisma.$queryRaw<{ escortId: string }[]>`
        SELECT "escortId"
        FROM "member_match_actions"
        WHERE "memberId" = ${session.user.id}
      `
      excludeIds = Array.isArray(rows) ? rows.map((r) => r.escortId) : []
    } catch {
      // If table not found (first deployment), ignore gracefully
      excludeIds = []
    }

    // Fetch candidate escorts
    const escorts = await prisma.user.findMany({
      where: {
        userType: 'ESCORT',
        isActive: true,
        id: excludeIds.length ? { notIn: excludeIds } : undefined,
        profile: {
          ...(preferredCity ? { city: { contains: preferredCity, mode: 'insensitive' } } : {}),
          ...(preferredCountry ? { country: { contains: preferredCountry, mode: 'insensitive' } } : {}),
        }
      },
      include: {
        profile: true
      },
      take: 100
    })

    // Score escorts based on preferences
    const scored = escorts.map((u) => {
      const p = u.profile
      const services: string[] = parseJSON<string[]>(p?.services ?? null, [])
      const appearance = {
        hairColor: p?.hairColor,
        bodyType: p?.bodyType,
        breastSize: p?.breastSize,
        hairLength: p?.hairLength,
        eyeColor: p?.eyeColor,
        breastType: p?.breastType,
        intimateArea: p?.intimateArea,
        clothingStyle: p?.clothingStyle,
        clothingSize: p?.clothingSize,
        shoeSize: p?.shoeSize,
        height: p?.height,
        weight: p?.weight,
      }
      const langs: string[] = parseJSON<string[]>(p?.languages ?? null, []).map((l) => String(l).toLowerCase())
      const piercings: string[] = parseJSON<string[]>(p?.piercings ?? null, []).map((v) => String(v).toLowerCase())
      const tattoos: string[] = parseJSON<string[]>(p?.tattoos ?? null, []).map((v) => String(v).toLowerCase())

      let score = 0
      // Services overlap
      if (preferredServices.length && services.length) {
        const set = new Set(services.map((s) => String(s).toLowerCase()))
        for (const s of preferredServices) if (set.has(s)) score += 5
      }
      // Languages overlap
      if (preferredLanguages.length && langs.length) {
        const set = new Set(langs)
        for (const l of preferredLanguages) if (set.has(l)) score += 2
      }
      // Piercings overlap
      if (preferredPiercings.length && piercings.length) {
        const set = new Set(piercings)
        for (const v of preferredPiercings) if (set.has(v)) score += 1
      }
      // Tattoos overlap
      if (preferredTattoos.length && tattoos.length) {
        const set = new Set(tattoos)
        for (const v of preferredTattoos) if (set.has(v)) score += 1
      }
      // Appearance matches
      for (const key of Object.keys(preferredAppearance)) {
        const want = preferredAppearance[key]
        const have = (appearance as any)[key]
        if (!want) continue
        if (Array.isArray(want)) {
          if (have && want.map((v) => String(v).toLowerCase()).includes(String(have).toLowerCase())) score += 2
        } else {
          if (have && String(have).toLowerCase() === String(want).toLowerCase()) score += 2
        }
      }
      // City boost
      if (preferredCity && p?.city && p.city.toLowerCase().includes(preferredCity.toLowerCase())) score += 1
      // Country boost
      if (preferredCountry && p?.country && p.country.toLowerCase().includes(preferredCountry.toLowerCase())) score += 1

      return { user: u, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, limit)

    const results = top.map(({ user }) => ({
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName || user.email.split('@')[0],
      city: user.profile?.city || null,
      country: user.profile?.country || null,
      avatar: user.profile?.avatar || null,
      image: (() => {
        try { const g = parseJSON<string[]>(user.profile?.gallery ?? null, []); return g[0] || null } catch { return null }
      })(),
      services: parseJSON<string[]>(user.profile?.services ?? null, []),
      appearance: {
        bodyType: user.profile?.bodyType,
        hairColor: user.profile?.hairColor,
        eyeColor: user.profile?.eyeColor,
      }
    }))

    return NextResponse.json({ suggestions: results }, { status: 200 })
  } catch (e) {
    console.error('Suggestions error', e)
    return NextResponse.json({ error: 'Server Fehler bei Vorschlägen' }, { status: 500 })
  }
}
