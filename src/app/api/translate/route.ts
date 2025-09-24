import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json()
    const input = typeof text === 'string' ? text.trim() : ''
    const lang = typeof targetLang === 'string' ? targetLang.trim().toLowerCase() : ''

    if (!input) {
      return NextResponse.json({ error: 'Text ist erforderlich.' }, { status: 400 })
    }
    if (!lang) {
      return NextResponse.json({ error: 'Zielsprache fehlt.' }, { status: 400 })
    }

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'MISTRAL_API_KEY ist nicht gesetzt.' }, { status: 500 })
    }

    const promptSystem = `Du bist ein professioneller Übersetzer. Übersetze den gegebenen Text präzise ins ${lang}. Behalte Bedeutung, Ton und Formatierung bei. Antworte NUR mit der Übersetzung, ohne zusätzliche Erklärungen.`

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: promptSystem },
          { role: 'user', content: input },
        ],
        temperature: 0.3,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '')
      return NextResponse.json({ error: `Mistral API Fehler: ${resp.status} ${errText}` }, { status: 500 })
    }

    const data = await resp.json()
    const translated = data?.choices?.[0]?.message?.content?.trim?.() || ''

    if (!translated) {
      return NextResponse.json({ error: 'Keine Übersetzung erhalten.' }, { status: 500 })
    }

    return NextResponse.json({ translated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unbekannter Fehler.' }, { status: 500 })
  }
}
