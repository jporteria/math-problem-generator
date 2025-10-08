import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { problem, answer, difficulty } = await request.json();

    // Validate required fields
    if (!problem || answer === undefined) {
      return NextResponse.json(
        { error: 'Problem and answer are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a prompt for step-by-step solution
    const solutionPrompt = `
You are a helpful math teacher explaining solutions to Primary 5 students (age 10-11). 

Problem: ${problem}
Correct Answer: ${answer}
Difficulty Level: ${difficulty}

Please provide a clear, step-by-step solution explanation that:
1. Breaks down the problem into simple, logical steps
2. Explains the reasoning behind each step
3. Uses language appropriate for Primary 5 students
4. Shows the mathematical operations clearly
5. Explains why this approach works

Format your response as a JSON object with this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "description": "First, identify what the problem is asking...",
      "calculation": "No calculation needed for this step",
      "explanation": "We need to understand what we're looking for before we start solving."
    },
    {
      "stepNumber": 2,
      "description": "Set up the calculation...",
      "calculation": "45 + 23",
      "explanation": "We add these numbers because we're combining two groups."
    }
  ],
  "finalAnswer": ${answer},
  "summary": "A brief summary of the solution approach and key learning points"
}

Make sure the explanation is encouraging and helps the student understand the concepts, not just memorize the steps.

Only return the JSON object, nothing else.`;

    const result = await model.generateContent(solutionPrompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the JSON response from Gemini - handle markdown code blocks
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Extract JSON from the text if it's embedded
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const solution = JSON.parse(jsonText);
      
      // Validate that we got the expected structure
      if (!solution.steps || !Array.isArray(solution.steps) || solution.steps.length === 0) {
        throw new Error('Invalid solution format');
      }

      // Ensure all steps have required fields
      const validSteps = solution.steps.filter(step => 
        step.stepNumber && 
        step.description && 
        step.explanation && 
        typeof step.description === 'string' && 
        typeof step.explanation === 'string'
      );
      
      if (validSteps.length === 0) {
        throw new Error('No valid steps generated');
      }

      return NextResponse.json({ 
        solution: {
          steps: validSteps,
          finalAnswer: solution.finalAnswer || answer,
          summary: solution.summary || "Follow these steps to solve similar problems."
        },
        success: true 
      });

    } catch (parseError) {
      console.error('Error parsing Gemini solution response:', parseError);
      
      // Fallback: create basic step-by-step solution
      const fallbackSolution = {
        steps: [
          {
            stepNumber: 1,
            description: "Read the problem carefully and identify what you need to find.",
            calculation: "No calculation needed",
            explanation: "Understanding the problem is the first step to solving it correctly."
          },
          {
            stepNumber: 2,
            description: "Identify the numbers and operation needed.",
            calculation: "Look for key words that tell you what to do",
            explanation: "Words like 'total', 'altogether' suggest addition. Words like 'left', 'remaining' suggest subtraction."
          },
          {
            stepNumber: 3,
            description: "Perform the calculation step by step.",
            calculation: "Work through the math carefully",
            explanation: "Take your time and double-check each step to avoid mistakes."
          },
          {
            stepNumber: 4,
            description: "Check if your answer makes sense.",
            calculation: `Final answer: ${answer}`,
            explanation: "Always ask yourself: 'Does this answer seem reasonable for this problem?'"
          }
        ],
        finalAnswer: answer,
        summary: "Remember to read carefully, identify the operation, calculate step by step, and check your work!"
      };

      return NextResponse.json({ 
        solution: fallbackSolution,
        success: true,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error generating solution:', error);
    
    // Return generic fallback solution
    const genericSolution = {
      steps: [
        {
          stepNumber: 1,
          description: "Read the problem carefully to understand what is being asked.",
          calculation: "No calculation needed",
          explanation: "Make sure you know what the problem wants you to find."
        },
        {
          stepNumber: 2,
          description: "Look for the important numbers and decide what operation to use.",
          calculation: "Identify the numbers in the problem",
          explanation: "Think about whether you need to add, subtract, multiply, or divide."
        },
        {
          stepNumber: 3,
          description: "Solve the problem step by step.",
          calculation: "Perform the calculation carefully",
          explanation: "Work through each step slowly and check your arithmetic."
        }
      ],
      finalAnswer: "Check your calculation",
      summary: "Take your time, work step by step, and always check your answer!"
    };

    return NextResponse.json({ 
      solution: genericSolution,
      success: true,
      error: 'Used generic solution due to error'
    });
  }
}