import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { escortOnboardingStep7Schema } from '@/lib/validations'

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
    if (typeof profile?.address === 'string') result.address = profile.address
    if (typeof profile?.city === 'string') result.city = profile.city
    if (typeof profile?.country === 'string') result.country = profile.country
    if (typeof profile?.zipCode === 'string') result.zipCode = profile.zipCode
    if (typeof profile?.latitude === 'number' && typeof profile?.longitude === 'number') {
      result.location = {
        lat: profile.latitude,
        lng: profile.longitude,
        placeId: profile.locationPlaceId ?? undefined,
        formattedAddress: profile.locationFormatted ?? undefined,
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Escort step 7 GET error:', error)
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
    const validated = escortOnboardingStep7Schema.parse(body)

    const updateData: any = {
      address: validated.address,
      city: validated.city,
      country: validated.country,
      zipCode: validated.zipCode ?? null,
    }
    if (validated.location) {
      updateData.latitude = validated.location.lat
      updateData.longitude = validated.location.lng
      if (validated.location.placeId) updateData.locationPlaceId = validated.location.placeId
      if (validated.location.formattedAddress) updateData.locationFormatted = validated.location.formattedAddress
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: { userId: session.user.id, ...updateData },
    })

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingStatus: 'IN_PROGRESS' } })

    return NextResponse.json({ message: 'Schritt 7 gespeichert', profile }, { status: 200 })
  } catch (error) {
    console.error('Escort step 7 POST error:', error)
    return NextResponse.json({ error: 'Server Fehler beim Onboarding' }, { status: 500 })
  }
}
