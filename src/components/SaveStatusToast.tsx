'use client'

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SaveStatusToast({ status, onRetry }: { status: SaveStatus; onRetry?: () => void }) {
    if (status === 'idle') return null

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
        {status === 'saving' && (
            <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 size={18} className="animate-spin" />
            <span className="font-medium">Saving to history...</span>
            </div>
        )}
        
        {status === 'saved' && (
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle size={18} />
            <span className="font-medium">Saved successfully</span>
            </div>
        )}
        
        {status === 'error' && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-2">
                <AlertCircle size={18} />
                <span className="font-medium">Failed to save</span>
            </div>
            {onRetry && (
                <button
                onClick={onRetry}
                className="text-sm bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 font-medium transition"
                >
                Retry now
                </button>
            )}
            </div>
        )}
        </div>
    )
}
