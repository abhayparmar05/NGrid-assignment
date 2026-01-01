import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="text-center max-w-md animate-fade-in">
                <div className="relative mb-8">
                    <h1 className="text-[150px] font-bold gradient-text leading-none">404</h1>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 blur-3xl opacity-50 -z-10"></div>
                </div>
                <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-400 mb-8">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/" className="btn-primary">
                        Go Home
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
