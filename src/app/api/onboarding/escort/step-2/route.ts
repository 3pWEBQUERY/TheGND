import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { escortOnboardingStep2Schema } from '@/lib/validations'

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

    const result: any = {}
    const fields = ['height','weight','bodyType','hairColor','hairLength','breastType','breastSize','intimateArea','clothingStyle','clothingSize','shoeSize','eyeColor'] as const
    for (const f of fields) {
      const v = (profile as any)?.[f]
      if (typeof v === 'string') (result as any)[f] = v
    }
    const piercings = parseList((profile as any)?.piercings)
    if (piercings) result.piercings = piercings
    const tattoos = parseList((profile as any)?.tattoos)
    if (tattoos) result.tattoos = tattoos

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Escort step 2 GET error:', error)
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
    const validated = escortOnboardingStep2Schema.parse(body)

    const updateData: any = { }
    const fields = ['height','weight','bodyType','hairColor','hairLength','breastType','breastSize','intimateArea','clothingStyle','clothingSize','shoeSize','eyeColor'] as const
    for (const f of fields) {
      const v = (validated as any)[f]
      updateData[f] = typeof v === 'string' ? v : null
    }
    if (validated.piercings) updateData.piercings = JSON.stringify(validated.piercings)
    if (validated.tattoos) updateData.tattoos = JSON.stringify(validated.tattoos)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: { userId: session.user.id, ...updateData },
    })

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingStatus: 'IN_PROGRESS' } })

    return NextResponse.json({ message: 'Schritt 2 gespeichert', profile }, { status: 200 })
  } catch (error) {
    console.error('Escort step 2 POST error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Onboarding' }, { status: 500 })
  }
}
