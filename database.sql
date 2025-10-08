-- Create users table for simple name-based authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create math_problem_sessions table
CREATE TABLE IF NOT EXISTS math_problem_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    problem_text TEXT NOT NULL,
    correct_answer NUMERIC NOT NULL,
    difficulty_level TEXT DEFAULT 'Beginner' CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'))
);

-- Create math_problem_submissions table
CREATE TABLE IF NOT EXISTS math_problem_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES math_problem_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_answer NUMERIC NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback_text TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'Beginner' CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    time_used_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to existing tables (if they don't exist)
-- These commands will run safely even if columns already exist
DO $$ 
BEGIN
    -- Add difficulty_level to sessions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_sessions' 
                   AND column_name = 'difficulty_level') THEN
        ALTER TABLE math_problem_sessions 
        ADD COLUMN difficulty_level TEXT DEFAULT 'Beginner' 
        CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));
    END IF;
    
    -- Add difficulty_level to submissions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_submissions' 
                   AND column_name = 'difficulty_level') THEN
        ALTER TABLE math_problem_submissions 
        ADD COLUMN difficulty_level TEXT DEFAULT 'Beginner' 
        CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));
    END IF;
    
    -- Add time_used_seconds to submissions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_submissions' 
                   AND column_name = 'time_used_seconds') THEN
        ALTER TABLE math_problem_submissions 
        ADD COLUMN time_used_seconds INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_score to submissions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_submissions' 
                   AND column_name = 'total_score') THEN
        ALTER TABLE math_problem_submissions 
        ADD COLUMN total_score NUMERIC DEFAULT 0;
    END IF;
    
    -- Add user_id to submissions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_submissions' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE math_problem_submissions 
        ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add hint column to sessions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'math_problem_sessions' 
                   AND column_name = 'hint') THEN
        ALTER TABLE math_problem_sessions 
        ADD COLUMN hint TEXT;
        
        -- Add a comment to document the column
        COMMENT ON COLUMN math_problem_sessions.hint IS 'Pre-generated hint for the math problem to help students understand the solution approach';
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE math_problem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_problem_submissions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous access (for assessment purposes)
-- In production, you would want more restrictive policies

-- Allow anonymous users to read and insert math_problem_sessions
CREATE POLICY "Allow anonymous access to math_problem_sessions" ON math_problem_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read and insert math_problem_submissions
CREATE POLICY "Allow anonymous access to math_problem_submissions" ON math_problem_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_math_problem_submissions_session_id ON math_problem_submissions(session_id);
CREATE INDEX idx_math_problem_sessions_created_at ON math_problem_sessions(created_at DESC);