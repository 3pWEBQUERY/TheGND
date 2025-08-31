import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const formData = await request.formData()
    const uploadType = (formData.get('type') as string) || 'gallery' // 'profile', 'gallery', 'story', 'post'
    // Unterstütze Mehrfach-Uploads: entweder mehrere 'files' oder ein einzelnes 'file'
    const filesFromArray = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null
    const files: File[] = filesFromArray && filesFromArray.length > 0
      ? filesFromArray
      : (singleFile ? [singleFile] : [])

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    // Zulässige Typen und Größen
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'] // mp4, webm, mov
    const maxImageSize = 15 * 1024 * 1024 // 15MB
    const maxVideoSize = 200 * 1024 * 1024 // 200MB

    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.user.id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Speichere alle Dateien
    const results: Array<{ url: string; filename: string; size: number; type: string; mediaType: 'image' | 'video'; uploadType: string }> = []

    for (const f of files) {
      const isImage = f.type.startsWith('image/')
      const isVideo = f.type.startsWith('video/')

      if (!isImage && !isVideo) {
        return NextResponse.json({ 
          error: 'Ungültiger Dateityp. Erlaubt sind Bilder (JPEG, PNG, WebP, GIF) und Videos (MP4, WebM, MOV).' 
        }, { status: 400 })
      }

      if (isImage && !allowedImageTypes.includes(f.type)) {
        return NextResponse.json({ 
          error: 'Ungültiger Bildtyp. Erlaubt sind JPEG, PNG, WebP, GIF.' 
        }, { status: 400 })
      }
      if (isVideo && !allowedVideoTypes.includes(f.type)) {
        return NextResponse.json({ 
          error: 'Ungültiger Videotyp. Erlaubt sind MP4, WebM, MOV.' 
        }, { status: 400 })
      }

      if (isImage && f.size > maxImageSize) {
        return NextResponse.json({ error: 'Datei zu groß. Bilder maximal 15MB.' }, { status: 400 })
      }
      if (isVideo && f.size > maxVideoSize) {
        return NextResponse.json({ error: 'Datei zu groß. Videos maximal 200MB.' }, { status: 400 })
      }

      const timestamp = Date.now()
      const extension = path.extname(f.name)
      const prefix = isImage ? 'gallery_img' : 'gallery_vid'
      const filename = `${prefix}_${uploadType}_${timestamp}_${Math.random().toString(36).slice(2,8)}${extension}`
      const filepath = path.join(uploadDir, filename)

      const bytes = await f.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      const publicUrl = `/uploads/${session.user.id}/${filename}`
      results.push({ url: publicUrl, filename, size: f.size, type: f.type, mediaType: isImage ? 'image' : 'video', uploadType })
    }

    return NextResponse.json({ files: results })
  } catch (error) {
    console.error('Fehler beim Hochladen der Datei:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Dateiname erforderlich' }, { status: 400 })
    }

    // Only allow deletion of user's own files
    const filepath = path.join(process.cwd(), 'public', 'uploads', session.user.id, filename)
    
    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises')
      await unlink(filepath)
      return NextResponse.json({ message: 'Datei gelöscht' })
    } else {
      return NextResponse.json({ error: 'Datei nicht gefunden' }, { status: 404 })
    }
  } catch (error) {
    console.error('Fehler beim Löschen der Datei:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}