import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

/**
 * POST endpoint to handle user login/registration
 * Creates user if doesn't exist, returns user data
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 })
    }

    const trimmedName = name.trim()

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('*')
      .eq('name', trimmedName)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('User search error:', searchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (existingUser) {
      // User exists, return existing user
      return NextResponse.json({
        id: existingUser.id,
        name: existingUser.name,
        created_at: existingUser.created_at
      })
    }

    // User doesn't exist, create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name: trimmedName }])
      .select()
      .single()

    if (insertError) {
      console.error('User creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      created_at: newUser.created_at
    })
  } catch (err) {
    console.error('Error in POST /api/auth/login:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}