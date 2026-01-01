'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { createBrowserClient } from '@/supabase/services/supabase'

export default function Navbar() {
    const { user, signOut, loading } = useAuth()
    const [cartCount, setCartCount] = useState(0)
    const supabase = useMemo(() => createBrowserClient(), [])
    const userId = user?.id

    const fetchCartCount = useCallback(async () => {
        if (!userId) return

        const { data } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', userId)

        if (data) {
            const total = data.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
            setCartCount(total)
        }
    }, [userId, supabase])

    useEffect(() => {
        const handleCartState = async () => {
            if (userId) {
                await fetchCartCount()
            } else {
                setCartCount(0)
            }
        }
        handleCartState()
    }, [userId, fetchCartCount])

    return (
        <nav className="glass sticky top-0 z-50 border-b border-card-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">Store</span>
                    </Link>

                    <div className="flex items-center space-x-4">

                        {!loading && (
                            <>
                                {user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-300"
                                        >
                                            <UserIcon className="w-5 h-5" />
                                            <span className="hidden sm:inline">Dashboard</span>
                                        </Link>

                                        <Link
                                            href="/cart"
                                            className="relative flex items-center space-x-1 text-foreground hover:text-primary transition-colors duration-300"
                                        >
                                            <ShoppingCartIcon className="w-5 h-5" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                                                    {cartCount}
                                                </span>
                                            )}
                                            <span className="hidden sm:inline">Cart</span>
                                        </Link>

                                        <button
                                            onClick={signOut}
                                            className="btn-secondary py-2 px-4 text-sm"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-foreground hover:text-primary transition-colors duration-300">
                                            Login
                                        </Link>
                                        <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
