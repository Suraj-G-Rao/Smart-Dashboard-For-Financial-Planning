/**
 * AI utilities for Gemini and Groq with PII redaction
 */

const DISCLAIMER = 'Educational only, not financial advice.'

/**
 * Redact PII from text before sending to LLMs
 */
export function redactPII(text: string): string {
  // Redact email addresses
  let redacted = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')

  // Redact phone numbers (various formats)
  redacted = redacted.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]')

  // Redact 16-digit card numbers
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')

  // Redact PAN (India)
  redacted = redacted.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, '[PAN]')

  // Redact Aadhaar (India)
  redacted = redacted.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[AADHAAR]')

  return redacted
}

/**
 * Ask Gemini (for reasoning and explanations)
 */
export async function askGemini(
  system: string,
  user: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const redactedUser = redactPII(user)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${system}\n\n${DISCLAIMER}\n\nUser: ${redactedUser}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini'
}

/**
 * Ask Groq (for fast responses)
 */
export async function askGroq(
  system: string,
  user: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const redactedUser = redactPII(user)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: `${system}\n\n${DISCLAIMER}` },
        { role: 'user', content: redactedUser },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response from Groq'
}

/**
 * Categorize transaction using AI
 */
export async function categorizeTransaction(
  merchant: string,
  amount: number,
  description: string
): Promise<{ category: string; subcategory: string; confidence: number }> {
  const prompt = `Categorize this transaction:
Merchant: ${merchant}
Amount: ₹${amount}
Description: ${description}

Return JSON only: {"category": "...", "subcategory": "...", "confidence": 0-1}`

  try {
    const response = await askGemini(
      'You are a financial transaction categorizer. Return strict JSON only.',
      prompt
    )

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        category: parsed.category || 'Uncategorized',
        subcategory: parsed.subcategory || '',
        confidence: parsed.confidence || 0,
      }
    }
  } catch (error) {
    console.error('Categorization error:', error)
  }

  return { category: 'Uncategorized', subcategory: '', confidence: 0 }
}
