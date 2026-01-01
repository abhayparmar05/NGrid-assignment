'use client'

import Link from 'next/link'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function VerifyEmailPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="card text-center max-w-md animate-scale-in">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <EnvelopeIcon className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold gradient-text mb-4">Check Your Email</h1>
                <p className="text-gray-400 mb-8">
                    We&apos;ve sent a verification link to your email address. Please verify your email to continue.
                </p>
                <div className="space-y-4">
                    <Link href="/login" className="btn-primary block w-full">
                        Return to Login
                    </Link>
                    <p className="text-sm text-gray-500">
                        Didn&apos;t receive the email? Check your spam folder.
                    </p>
                </div>
            </div>
        </div>
    )
}
