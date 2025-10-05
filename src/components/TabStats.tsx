'use client';
import { DifficultyLevel } from '@/app/actions/generateMathProblem';
import { getDifficultyBadgeColor } from '@/lib/utils';
import { Award } from 'lucide-react';

export interface ScoreStats {
    total: number
    correct: number
    byDifficulty: {
        easy: { total: number; correct: number }
        medium: { total: number; correct: number }
        hard: { total: number; correct: number }
    }
}


export function TabStats({ scores }: { scores: ScoreStats }) {
    
    const getAccuracy = (correct: number, total: number) => {
        return total === 0 ? 0 : Math.round((correct / total) * 100)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-blue-600" size={32} />
                    <h2 className="text-2xl font-bold text-gray-800">Overall Performance</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{scores.total}</p>
                    <p className="text-gray-600">Problems Attempted</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{scores.correct}</p>
                    <p className="text-gray-600">Correct Answers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">
                    {getAccuracy(scores.correct, scores.total)}%
                    </p>
                    <p className="text-gray-600">Accuracy</p>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Performance by Difficulty</h2>
                
                <div className="space-y-4">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
                    const stats = scores.byDifficulty[level]
                    const accuracy = getAccuracy(stats.correct, stats.total)
                    
                    return (
                    <div key={level} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getDifficultyBadgeColor(level)}`}>
                            {level}
                        </span>
                        <span className="text-gray-600">
                            {stats.correct}/{stats.total} correct
                        </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${
                            level === 'easy'
                                ? 'bg-green-500'
                                : level === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${accuracy}%` }}
                        />
                        </div>
                        <p className="text-right text-sm text-gray-600 mt-1">{accuracy}% accuracy</p>
                    </div>
                    )
                })}
                </div>
            </div>
        </div>
    )
}

