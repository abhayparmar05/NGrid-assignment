import { createBrowserClient } from './supabase'
import { Database } from '../types'
import { PostgrestError } from '@supabase/supabase-js'
import { Product } from './products'

// Type aliases for better readability
type CartItemRow = Database['public']['Tables']['cart_items']['Row']
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']

export interface CartItem extends CartItemRow {
    products?: Product
}

// Result types
interface CartResult {
    data: CartItem[] | null
    error: PostgrestError | null
}

interface MutationResult {
    error: PostgrestError | null
}

// Add product to cart
export async function addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
): Promise<MutationResult> {
    const supabase = createBrowserClient()

    // Check if item already exists in cart
    const { data: existing } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

    if (existing) {
        const existingItem = existing as CartItemRow
        // Update quantity
        const { error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id)

        return { error }
    }

    // Insert new cart item
    const insertData: CartItemInsert = {
        user_id: userId,
        product_id: productId,
        quantity,
    }

    const { error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .insert(insertData)

    return { error }
}

// Get cart items for a user
export async function getCartItems(userId: string): Promise<CartResult> {
    const supabase = createBrowserClient()

    const { data: cartItems, error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .select(`
            *,
            products (*)
        `)
        .eq('user_id', userId)

    return { data: cartItems as CartItem[] | null, error }
}

// Remove item from cart
export async function removeFromCart(cartItemId: string): Promise<MutationResult> {
    const supabase = createBrowserClient()

    const { error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('id', cartItemId)

    return { error }
}

// Clear cart
export async function clearCart(userId: string): Promise<MutationResult> {
    const supabase = createBrowserClient()

    const { error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('user_id', userId)

    return { error }
}

// Update cart item quantity
export async function updateCartItem(
    cartItemId: string,
    quantity: number
): Promise<MutationResult> {
    const supabase = createBrowserClient()

    const { error } = await (supabase.from('cart_items') as ReturnType<typeof supabase.from>)
        .update({ quantity })
        .eq('id', cartItemId)

    return { error }
}

// Export types for use in other files
export type { CartItemRow }
