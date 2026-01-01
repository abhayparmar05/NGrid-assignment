'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
    children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
    // Create QueryClient inside component to avoid sharing state between requests
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: how long data is considered fresh
                        staleTime: 60 * 1000, // 1 minute
                        // Cache time: how long inactive data stays in cache
                        gcTime: 5 * 60 * 1000, // 5 minutes
                        // Retry failed requests
                        retry: 1,
                        // Refetch on window focus in production
                        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
                    },
                    mutations: {
                        // Retry failed mutations once
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
