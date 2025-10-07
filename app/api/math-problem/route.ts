import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Generates a math problem using Google's Generative AI (Gemini)
 * Falls back to simple math problems if API is unavailable
 * @returns {Promise<{problem_text: string, final_answer: number}>}
 */
async function callAIForProblem() {
  const googleKey = process.env.GOOGLE_API_KEY;
  
  if (googleKey) {
    try {
      // Create a structured prompt for consistent JSON output
      const prompt = `You are an assistant that ONLY returns JSON.\\nReturn a single Primary 5 level math word problem as a JSON object with exactly two fields: \\n- \\"problem_text\\": a short word problem appropriate for Primary 5 (age 10-11). Do NOT include the answer in the text.\\n- \\"final_answer\\": the final numerical answer (an integer).\\n\\nReturn only the JSON and nothing else. Example: {"problem_text": "A bakery sold 45 cupcakes...", "final_answer": 15}`;

      const model = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleKey}`;

      // Make request to Google Generative AI
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        // Handle different types of API errors
        if (resp.status === 401 || resp.status === 403) {
          console.error(`Google Generative API authentication error (${resp.status}): check GOOGLE_API_KEY and IAM permissions. Response: ${text}`);
        } else if (resp.status === 404) {
            console.error(`Google Generative API returned 404: endpoint not found. Check model name and API path. URL: ${url} Response: ${text}`)
        } else {
          console.error(`Google Generative API returned non-OK status ${resp.status}: ${text}`);
        }
        throw new Error('Generative API error');
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof text === 'string') {
        // Extract and validate JSON from AI response
        const match = text.match(/\{[\s\S]*\}/)
        if (match) {
          try {
            const parsed = JSON.parse(match[0])
            // Validate the response structure
            if (parsed && typeof parsed.problem_text === 'string' && (typeof parsed.final_answer === 'number' || typeof parsed.final_answer === 'string')) {
              // Ensure numeric final_answer
              parsed.final_answer = Number(parsed.final_answer)
              return parsed
            }
          } catch (err) {
            console.error('Failed to parse JSON from Gemini reply', err)
          }
        }
      }
    } catch (err) {
      console.error('Gemini problem generation failed, falling back', err)
    }
  }

  // Fallback: Generate simple division problems when AI is unavailable
  const a = Math.floor(Math.random() * 50) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const problem_text = `A teacher has ${a} stickers. She gives ${b} stickers to each of her students. How many students can she give stickers to if she distributes them equally?`
  const final_answer = Math.floor(a / b)
  return { problem_text, final_answer }
}

/**
 * POST endpoint to generate new math problems
 * Creates a session and stores the problem in the database
 */
export async function POST(request: Request) {
  try {
    // Generate a new problem using AI or fallback
    const problem = await callAIForProblem()
    const { problem_text, final_answer } = problem

    // Save the problem session to database
    const { data, error } = await supabase
      .from('math_problem_sessions')
      .insert([{ problem_text, correct_answer: Number(final_answer) }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Return the problem and session ID to the client
    return NextResponse.json({ 
      problem: { problem_text, final_answer: Number(final_answer) }, 
      sessionId: data.id 
    })
  } catch (err) {
    console.error('Error in POST /api/math-problem:', err)
    return NextResponse.json({ error: 'Failed to generate problem' }, { status: 500 })
  }
}