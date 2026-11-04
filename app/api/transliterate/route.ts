import { NextResponse } from 'next/server';
import { getMultilingualList } from '@/lib/languages';

export async function POST(req: Request) {
  try {
    const { name, mode } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API key is configured, we can ask Gemini for full native scripts
    if (apiKey && name && mode === 'name') {
      try {
        const prompt = `Transliterate the person name "${name}" phonetically into 40 major world languages and their authentic native alphabets (e.g. Arabic, Russian Cyrillic, Hindi Devanagari, Japanese Katakana, Korean Hangul, Greek, Chinese Hanzi, Thai, Hebrew, Bengali, Tamil, etc.).
Return ONLY a valid JSON array of objects with keys: "language", "nativeLanguage", "text", "script". No extra markdown or text.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return NextResponse.json({ success: true, items: parsed, source: 'ai' });
            }
          }
        }
      } catch (err) {
        console.warn('AI transliteration error, using built-in engine:', err);
      }
    }

    // Default fast offline engine
    const items = getMultilingualList(name || 'You', mode || 'name');
    return NextResponse.json({ success: true, items, source: 'builtin' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
