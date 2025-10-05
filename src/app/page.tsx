'use client'

import { useEffect, useState } from 'react'
import { BookOpen, TrendingUp, Lightbulb, ListOrdered, History, Award } from 'lucide-react'
import { generateMathProblem, checkAnswer, DifficultyLevel, MathProblem } from './actions/generateMathProblem'
import { getDifficultyColor, getDifficultyBadgeColor } from '@/lib/utils'
import { ProblemHistory, TabHistory } from '@/components/TabHistory'
import { ScoreStats, TabStats } from '@/components/TabStats'


export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [showHint, setShowHint] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [activeTab, setActiveTab] = useState<'solve' | 'history' | 'stats'>('solve')
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<string | null>(null)
  
  const [history, setHistory] = useState<ProblemHistory[]>([])
  const [scores, setScores] = useState<ScoreStats>({
    total: 0,
    correct: 0,
    byDifficulty: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 }
    }
  })

  // Load history and scores from localStorage on mount, and save on updates
  const HISTORY_KEY = 'math_history'
  const SCORES_KEY = 'math_scores'
  const STORAGE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  const generateProblemHandler = async () => {
    setIsLoading(true)
    setFeedback('')
    setUserAnswer('')
    setIsCorrect(null)
    setSessionId(null)
    setShowHint(false)
    setShowSteps(false)
    setLastSubmittedAnswer(null)
    setProblem(null) // Clear previous problem

    const startTime = Date.now()

    try {
      const result = await generateMathProblem(difficulty)
      const elapsed = Date.now() - startTime
      console.log(`Generated problem in ${elapsed}ms:`);
      
      if (result.success && result.data) {
        setProblem(result.data)
        
        if (result.sessionId) {
          setSessionId(result.sessionId)
        }
        
        if (result.warning) {
          console.warn(result.warning)
        }

      } else {
        setFeedback('Failed to generate problem. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setFeedback('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!problem) return
    
    // Prevent duplicate submissions
    if (userAnswer === lastSubmittedAnswer) {
      setFeedback('You have already submitted this answer. Please try a different answer or generate a new problem.')
      return
    }
    
    setIsLoading(true)
    setFeedback('')
    
    try {
      const numericAnswer = parseFloat(userAnswer)
      
      if (isNaN(numericAnswer)) {
        setFeedback('Please enter a valid number.')
        setIsLoading(false)
        return
      }
      
      const result = await checkAnswer(
        numericAnswer,
        problem.final_answer,
        problem.problem_text,
        sessionId
      )
      
      if (result.success) {
        setIsCorrect(result.isCorrect)
        setFeedback(result.feedback || '')
        setLastSubmittedAnswer(userAnswer) // Store the submitted answer

        // Update history
        const historyEntry: ProblemHistory = {
          id: Date.now().toString(),
          problem: problem.problem_text,
          userAnswer: numericAnswer,
          correctAnswer: problem.final_answer,
          isCorrect: result.isCorrect || false,
          difficulty: difficulty,
          timestamp: new Date()
        }
        setHistory(prev => [historyEntry, ...prev])

        // Update scores
        setScores(prev => ({
          total: prev.total + 1,
          correct: prev.correct + (result.isCorrect ? 1 : 0),
          byDifficulty: {
            ...prev.byDifficulty,
            [difficulty]: {
              total: prev.byDifficulty[difficulty].total + 1,
              correct: prev.byDifficulty[difficulty].correct + (result.isCorrect ? 1 : 0)
            }
          }
        }))

      } else {
        setFeedback('Failed to check answer. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setFeedback('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
    setScores({
      total: 0,
      correct: 0,
      byDifficulty: {
        easy: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        hard: { total: 0, correct: 0 }
      }
    })
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(SCORES_KEY)
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">
          Math Problem Generator
        </h1>

        <div className="flex gap-2 mb-6 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => setActiveTab('solve')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'solve'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={20} />
            Solve
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History size={20} />
            History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={20} />
            Stats
          </button>
        </div>

        {activeTab === 'solve' && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Select Difficulty:</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={isLoading}
                    className={`py-2 px-4 rounded-lg font-medium transition duration-200 capitalize ${
                      difficulty === level
                        ? getDifficultyColor(level) + ' text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              <button
                onClick={generateProblemHandler}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform disabled:transform-none"
              >
                {isLoading ? 'Generating...' : `Generate ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem`}
              </button>
            </div>

            {problem && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">Problem:</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getDifficultyBadgeColor(difficulty)}`}>
                    {difficulty}
                  </span>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed mb-6">
                  {problem.problem_text}
                </p>

                <div className="flex gap-3 mb-6">
                  {problem.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                    >
                      <Lightbulb size={18} />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  )}
                  {problem.steps && problem.steps.length > 0 && (
                    <button
                      onClick={() => setShowSteps(!showSteps)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                    >
                      <ListOrdered size={18} />
                      {showSteps ? 'Hide Steps' : 'Show Steps'}
                    </button>
                  )}
                </div>

                {showHint && problem.hint && (
                  <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                    <p className="text-purple-900 font-medium">💡 Hint:</p>
                    <p className="text-purple-800">{problem.hint}</p>
                  </div>
                )}

                {showSteps && problem.steps && problem.steps.length > 0 && (
                  <div className="mb-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded">
                    <p className="text-indigo-900 font-medium mb-2">📝 Step-by-Step Solution:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      {problem.steps.map((step, index) => (
                        <li key={index} className="text-indigo-800">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <input
                      type="number"
                      id="answer"
                      step="any"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your answer"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    onClick={submitAnswer}
                    disabled={!userAnswer || isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? 'Checking...' : 'Submit Answer'}
                  </button>
                </div>
              </div>
            )}

            {isLoading && !problem && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Generating your math problem...</p>
                    <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
                  </div>
                </div>
              </div>
            )}

            {feedback && (
              <div className={`rounded-lg shadow-lg p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
                </h2>
                <p className="text-gray-800 leading-relaxed">{feedback}</p>
                
                {!isCorrect && (
                  <button
                    onClick={() => setUserAnswer('')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {activeTab === 'history' && (
          <>
            <TabHistory history={history} />
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Clear History
              </button>
            )}
          </>
        )}
        {activeTab === 'stats' && (<TabStats scores={scores} />)}
      </main>
    </div>
  )
}