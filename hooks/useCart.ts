import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '@/supabase/services/cart'

// Query keys
export const cartKeys = {
    all: ['cart'] as const,
    list: (userId: string) => [...cartKeys.all, 'list', userId] as const,
}

// Hook to fetch cart items
export function useCartItems(userId: string | undefined) {
    return useQuery({
        queryKey: cartKeys.list(userId || ''),
        queryFn: async () => {
            if (!userId) return []
            const { data, error } = await getCartItems(userId)
            if (error) throw error
            return data || []
        },
        enabled: !!userId,
    })
}

// Hook for adding to cart
export function useAddToCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            userId,
            productId,
            quantity,
        }: {
            userId: string
            productId: string
            quantity: number
        }) => {
            const { error } = await addToCart(userId, productId, quantity)
            if (error) throw error
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: cartKeys.list(variables.userId),
            })
        },
    })
}

// Hook for updating cart item quantity
export function useUpdateCartQuantity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            cartItemId,
            quantity,
            userId,
        }: {
            cartItemId: string
            quantity: number
            userId: string
        }) => {
            const { error } = await updateCartItem(cartItemId, quantity)
            if (error) throw error
            return { cartItemId, quantity, userId }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: cartKeys.list(variables.userId),
            })
        },
    })
}

// Hook for removing from cart
export function useRemoveFromCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            cartItemId,
            userId,
        }: {
            cartItemId: string
            userId: string
        }) => {
            const { error } = await removeFromCart(cartItemId)
            if (error) throw error
            return { userId }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: cartKeys.list(variables.userId),
            })
        },
    })
}

// Hook for clearing the cart
export function useClearCart() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await clearCart(userId)
            if (error) throw error
            return userId
        },
        onSuccess: (userId) => {
            queryClient.invalidateQueries({
                queryKey: cartKeys.list(userId),
            })
        },
    })
}

// Hook to get cart product IDs (for checking if item is in cart)
export function useCartProductIds(userId: string | undefined) {
    const { data: cartItems } = useCartItems(userId)

    const productIds = new Set<string>(
        cartItems?.map((item: { product_id: string }) => item.product_id) || []
    )

    return productIds
}

