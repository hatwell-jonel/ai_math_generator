'use client'
import { DifficultyLevel } from '@/app/actions/generateMathProblem'
import { getDifficultyBadgeColor } from '@/lib/utils'
import { History } from 'lucide-react'

export interface ProblemHistory {
    id: string
    problem: string
    userAnswer: number
    correctAnswer: number
    isCorrect: boolean
    difficulty: DifficultyLevel
    timestamp: Date
}

export function TabHistory({ history }: { history: ProblemHistory[] }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Problem History</h2>
            {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <History size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No problems solved yet. Start practicing!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((entry) => (
                        <div
                            key={entry.id}
                            className={`p-4 rounded-lg border-2 ${
                            entry.isCorrect
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyBadgeColor(entry.difficulty)}`}>
                                {entry.difficulty}
                            </span>
                            <span className="text-sm text-gray-500">
                                {entry.timestamp.toLocaleString()}
                            </span>
                            </div>
                            <p className="text-gray-800 mb-2">{entry.problem}</p>
                            <div className="flex items-center gap-4 text-sm">
                            <span className={entry.isCorrect ? 'text-green-700 font-medium' : 'text-red-700'}>
                                Your answer: {entry.userAnswer}
                            </span>
                            {!entry.isCorrect && (
                                <span className="text-gray-600">
                                Correct: {entry.correctAnswer}
                                </span>
                            )}
                            <span className={`ml-auto ${entry.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}