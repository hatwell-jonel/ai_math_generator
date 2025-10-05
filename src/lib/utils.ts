import { DifficultyLevel } from "@/app/actions/generateMathProblem"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDifficultyColor = (level: DifficultyLevel) => {
  switch (level) {
    case 'easy': return 'bg-green-500 hover:bg-green-600'
    case 'medium': return 'bg-yellow-500 hover:bg-yellow-600'
    case 'hard': return 'bg-red-500 hover:bg-red-600'
  }
}

export const getDifficultyBadgeColor = (level: DifficultyLevel) => {
  switch (level) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-300'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'hard': return 'bg-red-100 text-red-800 border-red-300'
  }
}