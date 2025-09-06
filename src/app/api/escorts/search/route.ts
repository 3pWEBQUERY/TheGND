import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getPrimaryImage(profile: any): string | null {
  if (profile?.avatar) return profile.avatar
  try {
    if (profile?.media) {
      const media = JSON.parse(profile.media)
      const firstImage = Array.isArray(media)
        ? media.find((m: any) => (m?.type?.toLowerCase?.() ?? '').includes('image'))
        : null
      if (firstImage?.url) return firstImage.url
    }
  } catch {}
  try {
    if (profile?.gallery) {
      const gallery = JSON.parse(profile.gallery)
      if (Array.isArray(gallery) && gallery[0]) return gallery[0]
    }
  } catch {}
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const location = searchParams.get('location')?.trim() || ''
  const take = Math.min(Number(searchParams.get('take') || '60'), 100)
  const skip = Math.max(Number(searchParams.get('skip') || '0'), 0)
  const verifiedOnly = searchParams.get('verifiedOnly') === '1'
  const ageVerifiedOnly = searchParams.get('ageVerifiedOnly') === '1'
  // Advanced filters
  const height = searchParams.get('height')?.trim() || ''
  const weight = searchParams.get('weight')?.trim() || ''
  const breastType = searchParams.get('breastType')?.trim() || ''
  const breastSize = searchParams.get('breastSize')?.trim() || ''
  const eyeColor = searchParams.get('eyeColor')?.trim() || ''
  const hairColor = searchParams.get('hairColor')?.trim() || ''
  const hairLength = searchParams.get('hairLength')?.trim() || ''
  const clothingStyle = searchParams.get('clothingStyle')?.trim() || ''
  const clothingSize = searchParams.get('clothingSize')?.trim() || ''

  const and: any[] = []
  if (q) {
    and.push({
      OR: [
        { profile: { is: { displayName: { contains: q, mode: 'insensitive' } } } },
        { profile: { is: { description: { contains: q, mode: 'insensitive' } } } },
      ],
    })
  }
  if (location) {
    and.push({
      OR: [
        { profile: { is: { city: { contains: location, mode: 'insensitive' } } } },
        { profile: { is: { country: { contains: location, mode: 'insensitive' } } } },
        { profile: { is: { locationFormatted: { contains: location, mode: 'insensitive' } } } },
      ],
    })
  }

  // Apply advanced filters against profile fields
  if (height) and.push({ profile: { is: { height: { contains: height, mode: 'insensitive' } } } })
  if (weight) and.push({ profile: { is: { weight: { contains: weight, mode: 'insensitive' } } } })
  if (breastType) and.push({ profile: { is: { breastType: { contains: breastType, mode: 'insensitive' } } } })
  if (breastSize) and.push({ profile: { is: { breastSize: { contains: breastSize, mode: 'insensitive' } } } })
  if (eyeColor) and.push({ profile: { is: { eyeColor: { contains: eyeColor, mode: 'insensitive' } } } })
  if (hairColor) and.push({ profile: { is: { hairColor: { contains: hairColor, mode: 'insensitive' } } } })
  if (hairLength) and.push({ profile: { is: { hairLength: { contains: hairLength, mode: 'insensitive' } } } })
  if (clothingStyle) and.push({ profile: { is: { clothingStyle: { contains: clothingStyle, mode: 'insensitive' } } } })
  if (clothingSize) and.push({ profile: { is: { clothingSize: { contains: clothingSize, mode: 'insensitive' } } } })

  const where: any = {
    userType: 'ESCORT',
    isActive: true,
    profile: { isNot: null },
    ...(and.length ? { AND: and } : {}),
  }

  // Fetch a superset, then post-filter for ageVerifiedOnly to avoid complex prisma conditions
  const [totalBase, usersBase] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Determine which users have an approved verification
  const ids = usersBase.map((u) => u.id)
  let approvedSet = new Set<string>()
  if (ids.length > 0) {
    try {
      const inList = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')
      const rows: Array<{ userId: string }> = await (prisma as any).$queryRawUnsafe(
        `SELECT DISTINCT "userId" FROM "verification_requests" WHERE "status"::text = 'APPROVED' AND "userId" IN (${inList})`
      )
      approvedSet = new Set(rows.map((r) => r.userId))
    } catch {}
  }

  // Build enriched array with flags
  const enriched = usersBase.map((u) => {
    const isVerified = u.profile?.visibility === 'VERIFIED'
    const isEscort = u.userType === 'ESCORT'
    const isAgeVerified = isEscort && approvedSet.has(u.id)
    return { u, isVerified, isAgeVerified, isEscort }
  })

  // Apply filters
  let filtered = enriched
  if (verifiedOnly) filtered = filtered.filter((x) => x.isVerified)
  if (ageVerifiedOnly) filtered = filtered.filter((x) => x.isEscort && x.isAgeVerified)

  const total = filtered.length
  // Pagination after filtering
  const pageSlice = filtered.slice(skip, skip + take)
  const users = pageSlice.map((x) => x.u)

  const items = users.map((u) => ({
    id: u.id,
    name: u.profile?.displayName ?? null,
    city: u.profile?.city ?? null,
    country: u.profile?.country ?? null,
    image: getPrimaryImage(u.profile) ?? null,
    visibility: u.profile?.visibility ?? null,
    isVerified: u.profile?.visibility === 'VERIFIED',
    isAgeVerified: u.userType === 'ESCORT' && approvedSet.has(u.id),
  }))

  return NextResponse.json({ total, items })
}
