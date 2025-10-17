import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { escortOnboardingStep5Schema } from '@/lib/validations'

function parseList(raw: unknown): string[] | undefined {
  try {
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (!trimmed) return undefined
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || trimmed.includes('"')) {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map((x) => String(x))
      }
      return trimmed
        .split(/[,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (Array.isArray(raw)) return raw.map((x) => String(x))
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

    const services = parseList(profile?.services) || []
    return NextResponse.json({ services }, { status: 200 })
  } catch (error) {
    console.error('Escort step 5 GET error:', error)
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
    const validated = escortOnboardingStep5Schema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { services: JSON.stringify(validated.services) },
      create: { userId: session.user.id, services: JSON.stringify(validated.services) },
    })

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingStatus: 'IN_PROGRESS' } })

    return NextResponse.json({ message: 'Schritt 5 gespeichert', profile }, { status: 200 })
  } catch (error) {
    console.error('Escort step 5 POST error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Onboarding' }, { status: 500 })
  }
}
