import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { text, mode, language } = await req.json()
    const input = (typeof text === 'string' ? text : '').trim()
    const op = (typeof mode === 'string' ? mode : 'improve').toLowerCase() as 'proofread' | 'improve' | 'extend'
    const lang = (typeof language === 'string' ? language : 'de').trim() || 'de'

    if (!input) return NextResponse.json({ error: 'Text ist erforderlich.' }, { status: 400 })

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'MISTRAL_API_KEY ist nicht gesetzt.' }, { status: 500 })

    const task = op === 'proofread'
      ? 'Korrigiere Grammatik, Rechtschreibung und Zeichensetzung. Bewahre Stil und Bedeutung. Formatiere in gut lesbaren Absätzen.'
      : op === 'extend'
      ? 'Verbessere und erweitere den Text. Mache ihn professioneller, konkreter und gehaltvoller. Nutze präzise Sprache, vermeide Wiederholungen.'
      : 'Verbessere Stil, Klarheit und Struktur. Mache den Text professioneller und flüssiger. Kürze unnötige Füllwörter.'

    const system = `Du bist ein professioneller Redakteur. Arbeite im folgenden Modus: ${op} (${task}). Antworte ausschließlich auf ${lang}. Gib NUR den überarbeiteten Text zurück, ohne Erklärungen oder Markups.`

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: input },
        ],
        temperature: 0.5,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '')
      return NextResponse.json({ error: `Mistral API Fehler: ${resp.status} ${errText}` }, { status: 500 })
    }

    const data = await resp.json()
    const output = data?.choices?.[0]?.message?.content?.trim?.() || ''
    if (!output) return NextResponse.json({ error: 'Keine Antwort erhalten.' }, { status: 500 })

    return NextResponse.json({ output })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unbekannter Fehler.' }, { status: 500 })
  }
}
