'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAddToCart } from '@/hooks/useCart'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

interface AddToCartButtonProps {
    productId: string
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
    const router = useRouter()
    const { user } = useAuth()
    const addToCartMutation = useAddToCart()
    const [added, setAdded] = useState(false)

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        try {
            await addToCartMutation.mutateAsync({
                userId: user.id,
                productId,
                quantity: 1,
            })
            setAdded(true)
            setTimeout(() => {
                router.push('/cart')
            }, 500)
        } catch {
            alert('Failed to add to cart')
        }
    }

    if (!user) {
        return (
            <button
                onClick={() => router.push('/login')}
                className="w-full btn-primary flex items-center justify-center gap-2"
            >
                <ShoppingCartIcon className="w-5 h-5" />
                Sign in to Add to Cart
            </button>
        )
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending || added}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
            <ShoppingCartIcon className="w-5 h-5" />
            {added
                ? 'Added! Redirecting...'
                : addToCartMutation.isPending
                    ? 'Adding to cart...'
                    : 'Add to Cart'}
        </button>
    )
}
