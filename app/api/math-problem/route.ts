import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Generates a math problem using Google's Generative AI (Gemini)
 * Falls back to simple math problems if API is unavailable
 * @param {string} problemType - The type of math problem to generate (addition, subtraction, multiplication, division, mixed)
 * @param {string} difficulty - The difficulty level (Beginner, Intermediate, Advanced, Expert)
 * @returns {Promise<{problem_text: string, final_answer: number}>}
 */
async function callAIForProblem(problemType: string = 'mixed', difficulty: string = 'Beginner') {
  const googleKey = process.env.GOOGLE_API_KEY;
  
  if (googleKey) {
    try {
      // Create type-specific prompts
      let operationType = '';
      switch (problemType) {
        case 'addition':
          operationType = ' The problem should involve ONLY addition operations.';
          break;
        case 'subtraction':
          operationType = ' The problem should involve ONLY subtraction operations.';
          break;
        case 'multiplication':
          operationType = ' The problem should involve ONLY multiplication operations.';
          break;
        case 'division':
          operationType = ' The problem should involve ONLY division operations.';
          break;
        case 'mixed':
        default:
          operationType = ' The problem can involve any mix of addition, subtraction, multiplication, or division operations.';
          break;
      }

      // Create difficulty-specific constraints
      let difficultyConstraints = '';
      let complexityLevel = '';
      switch (difficulty) {
        case 'Beginner':
          difficultyConstraints = ' Use numbers up to 50. Keep operations simple with 1-2 steps.';
          complexityLevel = 'very simple';
          break;
        case 'Intermediate':
          difficultyConstraints = ' Use numbers up to 100. Include 2-3 step problems with multiple operations.';
          complexityLevel = 'moderately challenging';
          break;
        case 'Advanced':
          difficultyConstraints = ' Use numbers up to 500. Include 3-4 step problems with multiple operations and fractions or decimals.';
          complexityLevel = 'challenging';
          break;
        case 'Expert':
          difficultyConstraints = ' Use larger numbers up to 1000. Include complex multi-step problems with fractions, decimals, and percentages.';
          complexityLevel = 'very challenging';
          break;
        default:
          difficultyConstraints = ' Use numbers up to 50. Keep operations simple.';
          complexityLevel = 'simple';
          break;
      }
      
      // Create a structured prompt for consistent JSON output with difficulty and hint
      const prompt = `You are an assistant that ONLY returns JSON.\\nReturn a single ${complexityLevel} Primary 5 level math word problem as a JSON object with exactly three fields: \\n- \\"problem_text\\": a short word problem appropriate for Primary 5 (age 10-11). Do NOT include the answer in the text.${operationType}${difficultyConstraints}\\n- \\"final_answer\\": the final numerical answer (an integer or decimal).\\n- \\"hint\\": a single helpful hint that guides the student toward the solution without giving away the answer. The hint should explain what mathematical concept or operation to consider.\\n\\nReturn only the JSON and nothing else. Example: {"problem_text": "A bakery sold 45 cupcakes...", "final_answer": 15, "hint": "Think about what operation you need to find the total when you're combining groups of items."}`;

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
            if (parsed && typeof parsed.problem_text === 'string' && (typeof parsed.final_answer === 'number' || typeof parsed.final_answer === 'string') && typeof parsed.hint === 'string') {
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

  // Fallback: Generate simple problems based on type and difficulty when AI is unavailable
  const generateFallbackProblem = (type: string, difficulty: string) => {
    // Adjust number ranges based on difficulty
    let maxA = 50, maxB = 20, maxMultiplier = 12;
    switch (difficulty) {
      case 'Beginner':
        maxA = 50; maxB = 20; maxMultiplier = 10;
        break;
      case 'Intermediate':
        maxA = 100; maxB = 50; maxMultiplier = 15;
        break;
      case 'Advanced':
        maxA = 300; maxB = 100; maxMultiplier = 20;
        break;
      case 'Expert':
        maxA = 500; maxB = 200; maxMultiplier = 25;
        break;
    }
    
    const a = Math.floor(Math.random() * maxA) + 1;
    const b = Math.floor(Math.random() * maxB) + 1;
    
    switch (type) {
      case 'addition':
        return {
          problem_text: `Sarah has ${a} stickers. Her friend gives her ${b} more stickers. How many stickers does Sarah have in total?`,
          final_answer: a + b,
          hint: "When you're combining two groups of items, think about which operation helps you find the total."
        };
      case 'subtraction':
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        return {
          problem_text: `A shop had ${larger} books. They sold ${smaller} books today. How many books are left?`,
          final_answer: larger - smaller,
          hint: "When items are taken away or removed, think about which operation helps you find what remains."
        };
      case 'multiplication':
        const small_a = Math.floor(Math.random() * 12) + 2;
        const small_b = Math.floor(Math.random() * 10) + 2;
        return {
          problem_text: `There are ${small_a} boxes of pencils. Each box contains ${small_b} pencils. How many pencils are there in total?`,
          final_answer: small_a * small_b,
          hint: "When you have equal groups of items, think about which operation helps you find the total quickly."
        };
      case 'division':
        const dividend = Math.floor(Math.random() * 50) + 10;
        const divisor = Math.floor(Math.random() * 8) + 2;
        const quotient = Math.floor(dividend / divisor);
        const actualDividend = quotient * divisor;
        return {
          problem_text: `A teacher has ${actualDividend} stickers. She gives ${divisor} stickers to each student. How many students can she give stickers to?`,
          final_answer: quotient,
          hint: "When you're sharing items equally among groups, think about which operation helps you find how many groups you can make."
        };
      default: // mixed
        return {
          problem_text: `A teacher has ${a} stickers. She gives ${b} stickers to each of her students. How many students can she give stickers to if she distributes them equally?`,
          final_answer: Math.floor(a / b),
          hint: "Think about what operation you use when dividing items equally among groups."
        };
    }
  };
  
  return generateFallbackProblem(problemType, difficulty);
}

/**
 * POST endpoint to generate new math problems
 * Creates a session and stores the problem in the database
 */
export async function POST(request: Request) {
  try {
    // Extract problem type and difficulty from request body
    const body = await request.json().catch(() => ({}));
    const problemType = body.problemType || 'mixed';
    const difficulty = body.difficulty || 'Beginner';
    
    // Generate a new problem using AI or fallback
    const problem = await callAIForProblem(problemType, difficulty)
    const { problem_text, final_answer, hint } = problem

    // Save the problem session to database with difficulty and hint
    const { data, error } = await supabase
      .from('math_problem_sessions')
      .insert([{ 
        problem_text, 
        correct_answer: Number(final_answer),
        difficulty_level: difficulty,
        hint: hint
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Return the problem and session ID to the client
    return NextResponse.json({ 
      problem: { problem_text, final_answer: Number(final_answer), hint }, 
      sessionId: data.id 
    })
  } catch (err) {
    console.error('Error in POST /api/math-problem:', err)
    return NextResponse.json({ error: 'Failed to generate problem' }, { status: 500 })
  }
}