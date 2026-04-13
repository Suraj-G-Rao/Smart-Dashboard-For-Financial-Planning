// LLM utilities for Gemini and Groq
// Uses only fetch - no external SDKs

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

interface GroqResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Gemini API with system prompt and user payload
 * Returns parsed JSON response
 */
export async function callGemini(
  system: string,
  userPayload: object | string
): Promise<any> {
  const userContent =
    typeof userPayload === 'string' ? userPayload : JSON.stringify(userPayload);

  const fullPrompt = `${system}\n\nUser Data:\n${userContent}\n\nRespond with valid JSON only.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data: GeminiResponse = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(jsonText.trim());
  } catch (e) {
    console.error('Failed to parse Gemini response as JSON:', text);
    throw new Error('Invalid JSON response from Gemini');
  }
}

/**
 * Call Groq API with system prompt and user text
 * Returns text response
 */
export async function callGroq(
  model: 'llama-3.1-70b' | 'mixtral-8x7b',
  system: string,
  userText: string
): Promise<string> {
  const modelMap = {
    'llama-3.1-70b': 'llama-3.1-70b-versatile',
    'mixtral-8x7b': 'mixtral-8x7b-32768',
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelMap[model],
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
