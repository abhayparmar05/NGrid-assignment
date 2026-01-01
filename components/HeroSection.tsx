'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function HeroSection() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                <div className="h-12 w-40 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-12 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            {user ? (
                <>
                    <Link href="/dashboard" className="btn-primary">
                        Go to Dashboard
                    </Link>
                    <Link href="/cart" className="btn-secondary">
                        View Cart
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/register" className="btn-primary">
                        Get Started
                    </Link>
                    <Link href="/login" className="btn-secondary">
                        Sign In
                    </Link>
                </>
            )}
        </div>
    )
}
