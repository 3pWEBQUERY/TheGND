import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any
    const form = await request.formData()
    const message = String(form.get('message') || '').trim()
    const emailRaw = String(form.get('email') || '').trim()

    if (!message) {
      return NextResponse.json({ error: 'message_required' }, { status: 400 })
    }

    await (prisma as any).feedback.create({
      data: {
        message,
        email: session?.user?.email ?? (emailRaw || null),
        userId: session?.user?.id ?? null,
      },
    })

    // Redirect back to /feedback with success flag
    const url = new URL('/feedback?success=1', request.url)
    return NextResponse.redirect(url)
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
