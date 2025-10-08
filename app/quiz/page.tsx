"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

/**
 * Interface for math problem data structure
 */
interface MathProblem {
  problem_text: string;
  final_answer: number;
  hint: string;
}

/**
 * Interface for user data
 */
interface User {
  id: string;
  name: string;
  created_at: string;
}

/**
 * Quiz component for the Math Problem Generator application
 * Handles problem generation, answer submission, and feedback display
 */

export default function QuizPage() {
  // User authentication
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  // Core application state
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  // Loading states for different actions
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Session and result tracking
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Score tracking state
  const [score, setScore] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  
  // Problem type selection state
  const [problemType, setProblemType] = useState("mixed");
  
  // Difficulty level state
  const [difficulty, setDifficulty] = useState("Beginner");
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimeUpPopup, setShowTimeUpPopup] = useState(false);

  // Hints system state
  const [hints, setHints] = useState<string[]>([]);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Solution system state
  const [solution, setSolution] = useState<any>(null);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  /**
   * Difficulty configuration with time limits and score multipliers
   */
  const difficultyConfig = {
    Beginner: { timeLimit: 120, multiplier: 1, color: "green" },
    Intermediate: { timeLimit: 90, multiplier: 1.5, color: "yellow" },
    Advanced: { timeLimit: 60, multiplier: 2, color: "orange" },
    Expert: { timeLimit: 45, multiplier: 2.5, color: "red" }
  };

  /**
   * Triggers a celebration confetti effect
   */
  const triggerConfetti = () => {
    // Create a burst of confetti from the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Add a second burst with different colors and timing
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 }
      });
    }, 250);
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 }
      });
    }, 400);
  };

  /**
   * Resets the score tracking to start over
   */
  const resetScore = () => {
    setScore(0);
    setTotalProblems(0);
    setTotalScore(0);
    setFeedback("");
    setIsCorrect(null);
    setTimeLeft(null);
    setIsTimerActive(false);
    setShowTimeUpPopup(false);
  };

  /**
   * Starts the timer for the current difficulty level
   */
  const startTimer = () => {
    const timeLimit = difficultyConfig[difficulty as keyof typeof difficultyConfig].timeLimit;
    setTimeLeft(timeLimit);
    setIsTimerActive(true);
  };

  /**
   * Internal function to submit answer (used by both manual submit and timer expiry)
   */
  const submitAnswerInternal = async () => {
    if (!sessionId) {
      setFeedback("No active session. Generate a problem first.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setIsTimerActive(false); // Stop timer when submitting

    try {
      // Submit answer to API for evaluation
      const res = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userAnswer: Number(userAnswer),
          difficulty,
          timeUsed: timeLeft !== null ? difficultyConfig[difficulty as keyof typeof difficultyConfig].timeLimit - timeLeft : 0,
          currentTotalScore: totalScore, // Send current total score
          userId: user?.id, // Include user ID for leaderboard tracking
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Submission failed");
      }

      const data = await res.json();
      // Update UI with feedback and result
      setFeedback(data.feedback || "No feedback");
      setIsCorrect(Boolean(data.isCorrect));
      
      // Trigger confetti if answer is correct
      if (Boolean(data.isCorrect)) {
        triggerConfetti();
      }
      
      // Update score tracking with difficulty multiplier
      setTotalProblems(prev => prev + 1);
      if (Boolean(data.isCorrect)) {
        const multiplier = difficultyConfig[difficulty as keyof typeof difficultyConfig].multiplier;
        setScore(prev => prev + 1); // Correct questions count (whole number)
        setTotalScore(prev => prev + multiplier); // Total score with multiplier
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      setFeedback("Error submitting answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check for user authentication
   */
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  /**
   * Timer effect to handle countdown
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerActive(false);
            // Increment total problems when time expires (counts as attempted)
            setTotalProblems(prevTotal => prevTotal + 1);
            // Show time up popup when timer expires
            setShowTimeUpPopup(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timeLeft]); // Simplified dependencies

  /**
   * Generates a new math problem by calling the API
   * Resets previous state and handles loading states
   */
  const generateProblem = async () => {
    setIsGenerating(true);
    setFeedback("");
    setIsCorrect(null);
    setIsTimerActive(false);
    setTimeLeft(null);
    setShowTimeUpPopup(false); // Close time up popup when generating new problem
    
    // Reset hints state for new problem
    setHints([]);
    setShowHints(false);
    setIsLoadingHint(false);

    // Reset solution state for new problem
    setSolution(null);
    setShowSolution(false);
    setIsGeneratingSolution(false);

    try {
      // Call the API to generate a new problem with selected type and difficulty
      const res = await fetch("/api/math-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemType, difficulty }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate problem");
      }

      const data = await res.json();
      // Update state with new problem and session
      setProblem({
        problem_text: data.problem.problem_text,
        final_answer: data.problem.final_answer,
        hint: data.problem.hint,
      });
      setSessionId(data.sessionId);
      setUserAnswer(""); // Clear previous answer
      
      // Start timer for the new problem
      startTimer();
    } catch (err: any) {
      console.error("Error generating problem:", err);
      setFeedback("Error generating problem. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handles answer submission and gets AI feedback
   * Validates session exists before submitting
   */
  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAnswerInternal();
  };

  /**
   * Generates hints for the current problem
   */
  const generateHints = async () => {
    if (!problem || !problem.hint) {
      setFeedback("No hint available for this problem.");
      return;
    }

    // Use the pre-generated hint from the database
    setHints([problem.hint]);
    setShowHints(true);
  };

  /**
   * Hides the hints panel
   */
  const hideHints = () => {
    setShowHints(false);
  };

  /**
   * Generates step-by-step solution for the current problem
   */
  const generateSolution = async () => {
    if (!problem) {
      setFeedback("No active problem to generate solution for.");
      return;
    }

    setIsGeneratingSolution(true);

    try {
      const res = await fetch("/api/solution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: problem.problem_text,
          answer: problem.final_answer,
          difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setSolution(data.solution);
      setShowSolution(true);
      
      if (data.fallback) {
        setFeedback("Generated basic solution steps due to AI service issue.");
      }
    } catch (err: any) {
      console.error("Error generating solution:", err);
      setFeedback("Error generating solution. Please try again.");
      
      // Provide fallback solution steps
      const fallbackSolution = {
        steps: [
          {
            stepNumber: 1,
            description: "Read the problem carefully and identify what you need to find.",
            calculation: "No calculation needed",
            explanation: "Understanding what the problem is asking is the first step."
          },
          {
            stepNumber: 2,
            description: "Identify the numbers and operation needed for this problem.",
            calculation: "Look for key words and numbers",
            explanation: "Determine whether you need to add, subtract, multiply, or divide."
          },
          {
            stepNumber: 3,
            description: "Solve the problem step by step.",
            calculation: "Perform the calculation",
            explanation: "Work through the math carefully and check your work."
          }
        ],
        finalAnswer: problem.final_answer,
        summary: "Take your time, work step by step, and always double-check your answer!"
      };
      setSolution(fallbackSolution);
      setShowSolution(true);
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  /**
   * Hides the solution panel
   */
  const hideSolution = () => {
    setShowSolution(false);
  };

  /**
   * Handles the "Try Again" action when time is up
   */
  const handleTryAgain = () => {
    setShowTimeUpPopup(false);
    generateProblem();
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-1 sm:space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
                <span className="font-medium sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link
                href="/history"
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">History</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
              <h1 className="text-xl font-bold text-gray-800 hidden md:block">Math Quiz</h1>
            </div>
            <div className="text-sm text-gray-600">
              Difficulty: <span className="font-semibold text-indigo-600">{difficulty}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Score Tracking Section - Always visible */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-center space-x-6">
            {/* Score Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {score}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Correct
              </div>
            </div>
            
            {/* Divider */}
            <div className="text-2xl font-light text-gray-300">/</div>
            
            {/* Total Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {totalProblems}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total
              </div>
            </div>
            
            {/* Divider */}
            <div className="text-2xl font-light text-gray-300">•</div>
            
            {/* Total Score Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {totalScore.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total Score
              </div>
            </div>
            
            {/* Percentage Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {totalProblems > 0 ? Math.round((score / totalProblems) * 100) : 0}%
              </div>
              <div className="text-sm font-medium text-gray-600">
                Accuracy
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <div className="flex items-center space-x-2">
                <span>{score} of {totalProblems} correct • Total Score: {totalScore.toFixed(1)} pts</span>
                <button
                  onClick={resetScore}
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  title="Reset Score"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${totalProblems > 0 ? (score / totalProblems) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Problem Generation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 transition-all">
          {/* Difficulty Level Selector */}
          <div className="mb-6">
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(difficultyConfig).map(([level, config]) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                    difficulty === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">{level}</div>
                    <div className="text-xs mt-1">{config.timeLimit}s • {config.multiplier}x pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Problem Type Selector */}
          <div className="mb-6">
            <label htmlFor="problemType" className="block text-sm font-medium text-gray-700 mb-2">
              Problem Type
            </label>
            <select
              id="problemType"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="mixed">Mixed (All Operations)</option>
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="division">Division</option>
            </select>
          </div>
          
          <button
            onClick={generateProblem}
            disabled={isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                {/* Loading spinner */}
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </div>
            ) : (
              "Generate New Problem"
            )}
          </button>
        </div>

        {/* Problem Display and Answer Submission Section */}
        {problem && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 transition-all duration-500 ease-in-out">
            {/* Timer Display */}
            {timeLeft !== null && (
              <div className="mb-6 text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${
                  timeLeft <= 10 
                    ? 'bg-red-100 text-red-700 animate-pulse' 
                    : timeLeft <= 30 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Difficulty: <span className="font-semibold">{difficulty}</span> • 
                  Points: <span className="font-semibold">{difficultyConfig[difficulty as keyof typeof difficultyConfig].multiplier}x</span>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Here is your problem:
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6 bg-gray-50 p-4 rounded-md border-l-4 border-indigo-200">
              {problem.problem_text}
            </p>

            {/* Hints Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-700">Need Help?</h3>
                <button
                  onClick={generateHints}
                  disabled={showHints}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {showHints ? "Hint Shown" : "💡 Get Hint"}
                </button>
              </div>

              {/* Hints Display */}
              {showHints && hints.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-blue-700">
                      💡 Hint
                    </span>
                    <button
                      onClick={hideHints}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✕ Close
                    </button>
                  </div>
                  
                  <div className="text-blue-800">
                    {hints[0]}
                  </div>
                </div>
              )}
            </div>

            {/* Answer submission form */}
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label
                  htmlFor="answer"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Answer
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Enter your numerical answer"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={!userAnswer || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isSubmitting ? "Submitting Answer..." : "Submit Answer"}
              </button>
            </form>
          </div>
        )}

        {/* Feedback Display Section */}
        {feedback && (
          <div
            className={`rounded-xl shadow-lg p-6 sm:p-8 transition-all duration-500 ease-in-out
              ${
                isCorrect === true
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-400"
                  : ""
              }
              ${
                isCorrect === false
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-400"
                  : ""
              }
              ${
                isCorrect === null
                  ? "bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400"
                  : ""
              }
            `}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {/* Feedback icons based on correctness */}
              {isCorrect === true && <span className="text-2xl mr-2">✅</span>}
              {isCorrect === false && <span className="text-2xl mr-2">🤔</span>}
              {isCorrect === null && <span className="text-2xl mr-2">🚨</span>}
              Feedback
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}

        {/* Solution Section - Only show after user has attempted the problem */}
        {feedback && (
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 mt-6 transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">Want to see how to solve it?</h3>
              <button
                onClick={generateSolution}
                disabled={isGeneratingSolution || showSolution}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                {isGeneratingSolution ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : showSolution ? "Solution Shown" : "📋 Get Step-by-Step Solution"}
              </button>
            </div>

            {/* Solution Display */}
            {showSolution && solution && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-green-700">
                    📋 Step-by-Step Solution
                  </span>
                  <button
                    onClick={hideSolution}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
                
                <div className="space-y-4">
                  {solution.steps && solution.steps.map((step: any, index: number) => (
                    <div key={index} className="border-l-4 border-green-300 pl-4">
                      <div className="font-semibold text-green-800 mb-1">
                        Step {step.stepNumber}: {step.description}
                      </div>
                      {step.calculation && step.calculation !== "No calculation needed" && (
                        <div className="text-sm font-mono bg-green-100 px-2 py-1 rounded mb-2">
                          {step.calculation}
                        </div>
                      )}
                      <div className="text-sm text-green-700">
                        {step.explanation}
                      </div>
                    </div>
                  ))}
                  
                  {solution.finalAnswer && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="font-bold text-green-800">
                        Final Answer: {solution.finalAnswer}
                      </div>
                    </div>
                  )}
                  
                  {solution.summary && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-sm text-green-700 italic">
                        💡 {solution.summary}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time Up Popup Modal */}
        {showTimeUpPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 mx-4 max-w-md w-full">
              <div className="text-center">
                {/* Clock icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                {/* Title and message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ⏰ Time's Up!
                </h3>
                <p className="text-gray-600 mb-6">
                  Don't worry! Practice makes perfect. Ready to try another problem?
                </p>
                
                {/* Action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    🚀 Try Again
                  </button>
                  <button
                    onClick={() => setShowTimeUpPopup(false)}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}