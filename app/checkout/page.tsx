'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCartItems, clearCart, CartItem } from '@/supabase/services/cart'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export default function CheckoutPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [completed, setCompleted] = useState(false)

    // Form States
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [name, setName] = useState('')
    const [cvv, setCvv] = useState('')

    const fetchCart = useCallback(async () => {
        if (!user) return

        const { data } = await getCartItems(user.id)

        if (data) {
            if (data.length === 0) {
                router.push('/cart')
                return
            }
            setCartItems(data)
        }
        setLoading(false)
    }, [user, router])

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                await fetchCart()
            }
            loadData()
        }
    }, [user, fetchCart])


    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.products?.price || 0) * item.quantity
        }, 0)
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Clear the cart
        if (user) {
            await clearCart(user.id)
        }

        setProcessing(false)
        setCompleted(true)
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (completed) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <div className="card text-center max-w-md animate-scale-in">
                    <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-16 h-16 text-success" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 gradient-text">Order Successful!</h2>
                    <p className="text-gray-400 mb-8">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                    <div className="space-y-3">
                        <Link href="/dashboard" className="btn-primary block">
                            Go to Dashboard
                        </Link>
                        <Link href="/" className="btn-secondary block">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Checkout Form */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Card Number
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => {
                                    // Remove all non-digits
                                    const val = e.target.value.replace(/\D/g, '')
                                    // Add spaces every 4 digits
                                    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ')
                                    setCardNumber(formatted)
                                }}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    maxLength={5}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '')
                                        if (val.length >= 2) {
                                            // Validate month
                                            const month = parseInt(val.substring(0, 2))
                                            if (month > 12) val = '12' + val.substring(2)
                                            if (month === 0) val = '01' + val.substring(2)

                                            val = val.substring(0, 2) + '/' + val.substring(2)
                                        }
                                        setExpiry(val)
                                    }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    CVV
                                </label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="123"
                                    maxLength={3}
                                    value={cvv}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        setCvv(val)
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                maxLength={30}
                                onChange={(e) => {
                                    // Allow alpha and spaces only
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setName(val)
                                }}
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full btn-primary disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : `Pay $${calculateTotal().toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="card sticky top-24">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 pb-4 border-b border-card-border">
                                    <Image
                                        src={item.products?.image_urls?.[0] || '/placeholder.png'}
                                        alt={item.products?.name || 'Product'}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">{item.products?.name}</h3>
                                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ${((item.products?.price || 0) * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-card-border pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400">Subtotal:</span>
                                <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-400">Shipping:</span>
                                <span className="font-semibold text-success">Free</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total:</span>
                                <span className="gradient-text">${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
