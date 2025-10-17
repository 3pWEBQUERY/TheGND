import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { escortOnboardingStep6Schema } from '@/lib/validations'

function parseRecord(raw: unknown): Record<string,string> | undefined {
  try {
    if (!raw) return undefined
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (!trimmed) return undefined
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') return Object.fromEntries(Object.entries(parsed).map(([k,v]) => [String(k), String(v as any)]))
    }
    if (typeof raw === 'object') {
      return Object.fromEntries(Object.entries(raw as any).map(([k,v]) => [String(k), String(v as any)]))
    }
  } catch {}
  return undefined
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.userType !== 'ESCORT') {
      return NextResponse.json({ error: 'Nur Escorts können dieses Onboarding verwenden' }, { status: 403 })
    }

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })

    const result: any = {}
    if (typeof profile?.phone === 'string') result.phone = profile.phone
    if (typeof profile?.website === 'string') result.website = profile.website
    const socialMedia = parseRecord(profile?.socialMedia)
    if (socialMedia) result.socialMedia = socialMedia

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Escort step 6 GET error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Laden' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.userType !== 'ESCORT') {
      return NextResponse.json({ error: 'Nur Escorts können dieses Onboarding verwenden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = escortOnboardingStep6Schema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        phone: validated.phone,
        website: validated.website ?? null,
        socialMedia: validated.socialMedia ? JSON.stringify(validated.socialMedia) : null,
      },
      create: {
        userId: session.user.id,
        phone: validated.phone,
        website: validated.website ?? null,
        socialMedia: validated.socialMedia ? JSON.stringify(validated.socialMedia) : null,
      },
    })

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingStatus: 'IN_PROGRESS' } })

    return NextResponse.json({ message: 'Schritt 6 gespeichert', profile }, { status: 200 })
  } catch (error) {
    console.error('Escort step 6 POST error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Onboarding' }, { status: 500 })
  }
}
