'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="card text-center max-w-md animate-fade-in">
                <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExclamationTriangleIcon className="w-10 h-10 text-error" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                <p className="text-gray-400 mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                {error.digest && (
                    <p className="text-xs text-gray-500 mb-4">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="btn-secondary"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={reset}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    )
}
