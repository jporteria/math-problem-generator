"use client";

import { useState } from "react";

/**
 * Interface for math problem data structure
 */
interface MathProblem {
  problem_text: string;
  final_answer: number;
}

/**
 * Main component for the Math Problem Generator application
 * Handles problem generation, answer submission, and feedback display
 */

export default function Home() {
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
  
  // Problem type selection state
  const [problemType, setProblemType] = useState("mixed");

  /**
   * Resets the score tracking to start over
   */
  const resetScore = () => {
    setScore(0);
    setTotalProblems(0);
    setFeedback("");
    setIsCorrect(null);
  };

  /**
   * Generates a new math problem by calling the API
   * Resets previous state and handles loading states
   */
  const generateProblem = async () => {
    setIsGenerating(true);
    setFeedback("");
    setIsCorrect(null);

    try {
      // Call the API to generate a new problem with selected type
      const res = await fetch("/api/math-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemType }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate problem");
      }

      const data = await res.json();
      // Update state with new problem and session
      setProblem({
        problem_text: data.problem.problem_text,
        final_answer: data.problem.final_answer,
      });
      setSessionId(data.sessionId);
      setUserAnswer(""); // Clear previous answer
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

    // Validate that we have an active session
    if (!sessionId) {
      setFeedback("No active session. Generate a problem first.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      // Submit answer to API for evaluation
      const res = await fetch("/api/math-problem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userAnswer: Number(userAnswer),
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
      
      // Update score tracking
      setTotalProblems(prev => prev + 1);
      if (Boolean(data.isCorrect)) {
        setScore(prev => prev + 1);
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      setFeedback("Error submitting answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Application Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
            Math Problem Generator
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            AI-powered math problem generator for Primary 5 students{" "}
          </p>
        </header>

        {/* Score Tracking Section */}
        {totalProblems > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex items-center justify-center space-x-8">
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
              
              {/* Percentage Display */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round((score / totalProblems) * 100)}%
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
                  <span>{score} of {totalProblems} correct</span>
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
                  style={{ width: `${(score / totalProblems) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Problem Generation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 transition-all">
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Here is your problem:
            </h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6 bg-gray-50 p-4 rounded-md border-l-4 border-indigo-200">
              {problem.problem_text}
            </p>

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
      </main>
    </div>
  );
}
