import { ProblemHistory } from "@/components/TabHistory";
import { ScoreStats } from "@/components/TabStats";
import { useEffect } from "react";

interface SaveToLocalStorageProps {
  setHistory: (history: ProblemHistory[]) => void,
  history?: ProblemHistory[],
  setScores: (scores: ScoreStats) => void
  scores?: ScoreStats,
  HISTORY_KEY: string,
  SCORES_KEY: string
  STORAGE_EXPIRY: number
}

function saveToLocalStorage({ setHistory, setScores, history, scores, HISTORY_KEY, SCORES_KEY, STORAGE_EXPIRY }: SaveToLocalStorageProps) {
    const saveToLocalStorage = (key: string, value: any) => {
        const data = {
        value,
        timestamp: Date.now()
        }
        localStorage.setItem(key, JSON.stringify(data))
    }

    const loadFromLocalStorage = (key: string) => {
        const dataStr = localStorage.getItem(key)
        if (!dataStr) return null
        try {
        const data = JSON.parse(dataStr)
        if (Date.now() - data.timestamp > STORAGE_EXPIRY) {
            localStorage.removeItem(key)
            return null
        }
        return data.value
        } catch {
        return null
        }
    }

    useEffect(() => {
        const savedHistory = loadFromLocalStorage(HISTORY_KEY)
        if (savedHistory) setHistory(savedHistory)

        const savedScores = loadFromLocalStorage(SCORES_KEY)
        if (savedScores) setScores(savedScores)
    }, [])

    useEffect(() => saveToLocalStorage(HISTORY_KEY, history), [history])
    useEffect(() => saveToLocalStorage(SCORES_KEY, scores), [scores])
}

export default saveToLocalStorage;