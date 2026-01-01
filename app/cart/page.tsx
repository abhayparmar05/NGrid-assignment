'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCartItems, removeFromCart, updateCartItem, CartItem } from '@/supabase/services/cart'
import { TrashIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [removing, setRemoving] = useState<string | null>(null)

    const fetchCart = useCallback(async () => {
        if (!user) return

        const { data } = await getCartItems(user.id)

        if (data) {
            setCartItems(data)
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                await fetchCart()
            }
            loadData()
        }
    }, [user, fetchCart])


    const handleRemoveItem = async (cartItemId: string) => {
        setRemoving(cartItemId)
        const { error } = await removeFromCart(cartItemId)

        if (!error) {
            fetchCart()
        }
        setRemoving(null)
    }

    const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return

        // Optimistic update
        setCartItems(items => items.map(item =>
            item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        ))

        const { error } = await updateCartItem(cartItemId, newQuantity)

        if (error) {
            // Revert on error
            fetchCart()
        }
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.products?.price || 0) * item.quantity
        }, 0)
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <div className="card text-center max-w-md">
                    <div className="w-24 h-24 bg-card-border rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBagIcon className="w-12 h-12 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-400 mb-6">Browse products and add them to your cart</p>
                    <Link href="/" className="btn-primary inline-block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-8">Shopping Cart</h1>

            <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="card flex gap-4 items-center">
                            <Image
                                src={item.products?.image_urls?.[0] || '/placeholder.png'}
                                alt={item.products?.name || 'Product'}
                                width={96}
                                height={96}
                                className="w-24 h-24 object-cover rounded-lg"
                            />

                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">{item.products?.name}</h3>
                                <div className="flex items-center gap-3 mb-2">
                                    <label className="text-gray-400 text-sm">Quantity:</label>
                                    <div className="flex items-center gap-2 bg-card-bg border border-card-border rounded-lg p-1">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                                        >
                                            <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-primary font-semibold">
                                    ${((item.products?.price || 0) * item.quantity).toFixed(2)}
                                </p>
                            </div>

                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={removing === item.id}
                                className="btn-secondary py-2 px-3 hover:bg-error/20 hover:border-error transition-colors"
                                title="Remove from cart"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-semibold">Total:</span>
                        <span className="text-3xl font-bold gradient-text">
                            ${calculateTotal().toFixed(2)}
                        </span>
                    </div>

                    <Link href="/checkout" className="btn-primary block text-center w-full">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    )
}
