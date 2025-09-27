import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()
    const normEmail = String(email).trim().toLowerCase()

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, Password und User Type sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if user already exists (select minimal fields to avoid schema drift issues)
    const existingUser = await prisma.user.findUnique({
      where: { email: normEmail },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ein User mit dieser Email existiert bereits' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normEmail,
        password: hashedPassword,
        userType: userType as UserType,
        onboardingStatus: 'NOT_STARTED'
      },
      // Return only safe fields explicitly to avoid selecting columns that might not exist yet
      select: { id: true, email: true, userType: true, onboardingStatus: true }
    })

    return NextResponse.json(
      { 
        message: 'User erfolgreich registriert',
        user
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Server Fehler bei der Registrierung' },
      { status: 500 }
    )
  }
}