'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ProblemHistoryItem {
  id: string
  problemText: string
  correctAnswer: string
  difficulty: string
  userAnswer: string
  isCorrect: boolean
  feedback: string
  timeUsed: number
  date: string
  time: string
  submittedAt: string
}

export default function ProblemHistory() {
  const [history, setHistory] = useState<ProblemHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProblemHistory()
  }, [])

  const fetchProblemHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/problem-history')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setHistory(data)
    } catch (err) {
      console.error('Error fetching problem history:', err)
      setError('Failed to load problem history. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-blue-600 bg-blue-100'
      case 'hard': return 'text-orange-600 bg-orange-100'
      case 'expert': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading problem history...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Problem History</h1>
          <p className="text-gray-600">Review your recent math problems and performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Problems</h3>
            <p className="text-3xl font-bold text-blue-600">{history.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Correct Answers</h3>
            <p className="text-3xl font-bold text-green-600">
              {history.filter(item => item.isCorrect).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {history.length > 0 
                ? `${Math.round((history.filter(item => item.isCorrect).length / history.length) * 100)}%`
                : '0%'
              }
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchProblemHistory}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Problems Yet</h3>
            <p className="text-gray-500 mb-6">Start solving math problems to see your history here!</p>
            <Link
              href="/quiz"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Quiz
            </Link>
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">{item.date} at {item.time}</span>
                      <span className="text-sm text-gray-500">• {formatTime(item.timeUsed)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Problem #{history.length - index}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-2 ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {item.isCorrect ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Problem:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded border font-mono">{item.problemText}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                      <p className={`p-3 rounded border font-mono ${
                        item.isCorrect 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {item.userAnswer}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                      <p className="p-3 rounded border font-mono bg-green-50 text-green-800 border-green-200">
                        {item.correctAnswer}
                      </p>
                    </div>
                  </div>

                  {item.feedback && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                        {item.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Action */}
        {history.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/quiz"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Solve More Problems
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}