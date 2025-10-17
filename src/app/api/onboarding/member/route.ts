import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { memberOnboardingSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || user.userType !== 'MEMBER') {
      return NextResponse.json({ error: 'Nur Mitglieder können dieses Onboarding verwenden' }, { status: 403 })
    }

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })

    const result: any = {}
    if (typeof profile?.displayName === 'string') result.displayName = profile.displayName
    if (typeof profile?.age === 'number') result.age = profile.age
    if (profile?.gender) result.gender = profile.gender
    if (typeof profile?.location === 'string') result.location = profile.location
    if (typeof profile?.bio === 'string') result.bio = profile.bio
    if (typeof profile?.preferences === 'string') result.preferences = profile.preferences

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Member onboarding GET error:', error)
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
    if (!user || user.userType !== 'MEMBER') {
      return NextResponse.json({ error: 'Nur Mitglieder können dieses Onboarding verwenden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = memberOnboardingSchema.parse(body)

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName: validated.displayName ?? null,
        age: validated.age ?? null,
        gender: validated.gender ?? null,
        location: validated.location ?? null,
        bio: validated.bio ?? null,
        preferences: validated.preferences ?? null,
      },
      create: {
        userId: session.user.id,
        displayName: validated.displayName ?? null,
        age: validated.age ?? null,
        gender: validated.gender ?? null,
        location: validated.location ?? null,
        bio: validated.bio ?? null,
        preferences: validated.preferences ?? null,
      },
    })

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingStatus: 'IN_PROGRESS' } })

    return NextResponse.json({ message: 'Mitglied-Onboarding gespeichert', profile }, { status: 200 })
  } catch (error) {
    console.error('Member onboarding POST error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Onboarding' }, { status: 500 })
  }
}
