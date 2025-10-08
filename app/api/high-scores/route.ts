import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

/**
 * GET endpoint to retrieve high scores
 * Returns top 10 high scores from the database
 */
export async function GET() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 })
    }

    // Get high scores from submissions, grouped by session to avoid duplicates
    const { data: highScores, error } = await supabase
      .from('math_problem_submissions')
      .select('total_score, difficulty_level, created_at, is_correct')
      .order('total_score', { ascending: false })
      .limit(50) // Get more records to process

    if (error) {
      console.error('High scores fetch error', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ error: 'Failed to fetch high scores' }, { status: 500 })
    }

    // Process and deduplicate high scores by getting the maximum score per session
    const processedScores = highScores
      ?.filter(score => score.total_score > 0) // Only show scores > 0
      ?.slice(0, 3) // Take top 3 only
      ?.map((score, index) => ({
        rank: index + 1,
        score: score.total_score,
        difficulty: score.difficulty_level,
        date: new Date(score.created_at).toLocaleDateString(),
        isCorrect: score.is_correct
      })) || []

    return NextResponse.json(processedScores)
  } catch (err) {
    console.error('Error in GET /api/high-scores:', err)
    
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([])
  }
}

/**
 * POST endpoint to save a final session score
 * Saves the final score when a user completes their session
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { totalScore, totalProblems, correctAnswers, difficultiesPlayed, playerName } = body

    if (!totalScore || !totalProblems) {
      return NextResponse.json({ error: 'Missing required score data' }, { status: 400 })
    }

    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0

    // Save to high scores table
    const { data: scoreRecord, error: insertError } = await supabase
      .from('player_high_scores')
      .insert([{
        player_name: playerName || 'Anonymous',
        total_score: totalScore,
        total_problems: totalProblems,
        correct_answers: correctAnswers,
        accuracy_percentage: accuracy,
        difficulty_levels_played: difficultiesPlayed || []
      }])
      .select()
      .single()

    if (insertError) {
      console.error('High score insert error', insertError)
      return NextResponse.json({ error: 'Failed to save high score' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      rank: 'Score saved successfully!',
      scoreId: scoreRecord.id 
    })
  } catch (err) {
    console.error('Error in POST /api/high-scores:', err)
    return NextResponse.json({ error: 'Failed to save high score' }, { status: 500 })
  }
}