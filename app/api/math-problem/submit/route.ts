import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

/**
 * Generates AI-powered feedback for student answers
 * Provides encouraging and educational responses
 */
async function callAIForFeedback({ problem_text, correctAnswer, userAnswer, isCorrect }: { problem_text: string; correctAnswer: number; userAnswer: number; isCorrect: boolean }) {
  const googleKey = process.env.GOOGLE_API_KEY;
  
  if (googleKey) {
    try {
      const prompt = `You are a friendly tutor. Given the problem:\\n${problem_text}\\nCorrect answer: ${correctAnswer}\\nStudent answer: ${userAnswer}\\nThe student was ${isCorrect ? 'correct' : 'incorrect'}. Provide brief, encouraging, and actionable feedback appropriate for a Primary 5 student. Keep it to 2-4 sentences.`;

      const model = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleKey}`;

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
        if (resp.status === 401 || resp.status === 403) {
          console.error(`Google Generative API authentication error (${resp.status}): check GOOGLE_API_KEY and IAM permissions. Response: ${text}`);
        } else {
          console.error(`Google Generative API returned non-OK status ${resp.status}: ${text}`);
        }
        throw new Error('Generative API error');
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return typeof text === 'string' ? text.trim() : undefined
    } catch (err) {
      console.error('Gemini feedback failed, falling back', err)
    }
  }

  // Fallback feedback when AI is unavailable
  if (isCorrect) {
    return `Well done! You answered correctly. Keep practising similar questions to stay sharp.`
  }
  return `Nice try! The correct answer is ${correctAnswer}. Reread the question and try to work step by step — draw or list what you know first.`
}

/**
 * POST endpoint to submit and evaluate student answers
 * Compares answer with correct solution and generates feedback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, userAnswer } = body

    // Validate required parameters
    if (!sessionId || typeof userAnswer !== 'number') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Fetch the problem session from database
    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Session fetch error', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Compare user answer with correct answer
    const correctAnswer = Number(session.correct_answer)
    const isCorrect = Number(userAnswer) === correctAnswer

    // Generate personalized feedback using AI
    const feedback = await callAIForFeedback({ 
      problem_text: session.problem_text, 
      correctAnswer, 
      userAnswer, 
      isCorrect 
    })

    // Save the submission to database for tracking
    const { data: submission, error: insertError } = await supabase
      .from('math_problem_submissions')
      .insert([{ 
        session_id: sessionId, 
        user_answer: userAnswer, 
        is_correct: isCorrect, 
        feedback_text: feedback 
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Insert submission error', insertError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // Return result and feedback to client
    return NextResponse.json({ isCorrect, feedback })
  } catch (err) {
    console.error('Error in POST /api/math-problem/submit:', err)
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}
