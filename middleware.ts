import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res }, {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const protectedPaths = ['/dashboard', '/cart', '/checkout']
    const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    if (isProtected && !session) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect logged-in users away from auth pages
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|icon.svg).*)'],
}
