import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

/**
 * GET endpoint to retrieve problem history
 * Returns recent problems with their submissions
 */
export async function GET() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 })
    }

    // Get recent problems with their submissions
    const { data: problemHistory, error } = await supabase
      .from('math_problem_sessions')
      .select(`
        id,
        problem_text,
        correct_answer,
        difficulty_level,
        created_at,
        math_problem_submissions (
          user_answer,
          is_correct,
          feedback_text,
          time_used_seconds,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20) // Get last 20 problems

    if (error) {
      console.error('Problem history fetch error', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ error: 'Failed to fetch problem history' }, { status: 500 })
    }

    // Process the data to a more usable format
    const processedHistory = problemHistory
      ?.filter(problem => problem.math_problem_submissions && problem.math_problem_submissions.length > 0) // Only problems with submissions
      ?.map(problem => ({
        id: problem.id,
        problemText: problem.problem_text,
        correctAnswer: problem.correct_answer,
        difficulty: problem.difficulty_level,
        createdAt: problem.created_at,
        submission: problem.math_problem_submissions[0], // Get the first (and usually only) submission
        userAnswer: problem.math_problem_submissions[0]?.user_answer,
        isCorrect: problem.math_problem_submissions[0]?.is_correct,
        feedback: problem.math_problem_submissions[0]?.feedback_text,
        timeUsed: problem.math_problem_submissions[0]?.time_used_seconds,
        submittedAt: problem.math_problem_submissions[0]?.created_at,
        date: new Date(problem.created_at).toLocaleDateString(),
        time: new Date(problem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })) || []

    return NextResponse.json(processedHistory)
  } catch (err) {
    console.error('Error in GET /api/problem-history:', err)
    
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([])
  }
}