import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const job = await prisma.job.findUnique({
      where: { id },
      include: { postedBy: { include: { profile: true } } },
    })
    if (!job) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

    const data = {
      id: job.id,
      title: job.title,
      shortDesc: job.shortDesc,
      description: job.description,
      category: job.category,
      location: job.location,
      city: job.city,
      country: job.country,
      salaryInfo: job.salaryInfo,
      contactInfo: job.contactInfo,
      media: (() => { try { return job.media ? JSON.parse(job.media) : [] } catch { return [] } })(),
      isActive: job.isActive,
      createdAt: job.createdAt,
      postedBy: {
        id: job.postedById,
        userType: (job as any).postedBy.userType,
        displayName: (job as any).postedBy.profile?.displayName ?? null,
        avatar: (job as any).postedBy.profile?.avatar ?? null,
        companyName: (job as any).postedBy.profile?.companyName ?? null,
      },
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/jobs/[id] error:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
