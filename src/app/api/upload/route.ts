import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Deprecated legacy uploader. Please use UploadThing at /api/uploadthing.
  return NextResponse.json(
    { error: 'Diese Upload-Route ist veraltet. Bitte verwenden Sie UploadThing (/api/uploadthing).' },
    { status: 410 }
  )
}

export async function DELETE(request: NextRequest) {
  // Deprecated legacy uploader deletion. Remote deletions are not supported here.
  return NextResponse.json(
    { error: 'Diese Upload-Route ist veraltet. Löschen ist hier nicht mehr unterstützt.' },
    { status: 410 }
  )
}