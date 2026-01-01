import { createBrowserClient } from './supabase'
import { Database } from '../types'
import { nanoid } from 'nanoid'
import { PostgrestError } from '@supabase/supabase-js'

// Type aliases for better readability
type ProductRow = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type ProductLikeRow = Database['public']['Tables']['product_likes']['Row']

export interface Product extends ProductRow {
    likes_count?: number
    has_liked?: boolean
}

interface ProductWithLikes {
    id: string
    user_id: string
    name: string
    description: string
    price: number
    share_id: string
    image_urls: string[]
    created_at: string | null
    category: string | null
    tags: string[] | null
    likes: Array<{ count: number }>
}

interface ProductLike {
    product_id: string
}

// Result types for better type inference
interface ProductResult {
    data: Product | null
    error: PostgrestError | null
}

interface ProductsResult {
    data: Product[] | null
    error: PostgrestError | null
}

interface MutationResult {
    error: PostgrestError | null
}

interface LikeResult {
    error: PostgrestError | null
    liked: boolean
}

// Generate a unique share ID for public product URLs
export function generateShareId(): string {
    return nanoid(10)
}

// Upload image to Supabase Storage
export async function uploadProductImage(file: File, userId: string): Promise<string | null> {
    const supabase = createBrowserClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${nanoid(10)}.${fileExt}`
    const filePath = fileName

    const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file)

    if (error) {
        console.error('Error uploading image:', error)
        return null
    }

    const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

    return data.publicUrl
}

// Create a new product
export async function createProduct(
    userId: string,
    name: string,
    description: string,
    price: number,
    imageUrls: string[],
    category?: string,
    tags?: string[]
): Promise<ProductResult> {
    const supabase = createBrowserClient()

    const insertData = {
        user_id: userId,
        name,
        description,
        price,
        share_id: generateShareId(),
        image_urls: imageUrls,
        category: category ?? null,
        tags: tags ?? null,
    }

    const { data, error } = await (supabase.from('products') as ReturnType<typeof supabase.from>)
        .insert(insertData as ProductInsert)
        .select()
        .single()

    return { data: data as Product | null, error }
}

// Get all products for a user with pagination and filtering
export async function getUserProducts(
    userId: string,
    page: number = 1,
    limit: number = 12,
    category?: string
): Promise<ProductsResult> {
    const supabase = createBrowserClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build the query
    let query = (supabase.from('products') as ReturnType<typeof supabase.from>)
        .select(`
            *,
            likes:product_likes(count)
        `)
        .eq('user_id', userId)

    if (category && category !== 'All') {
        query = query.eq('category', category)
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

    if (data && data.length > 0) {
        // Get current user's likes for these products
        const productIds = (data as ProductWithLikes[]).map((p) => p.id)
        const { data: userLikes } = await (supabase.from('product_likes') as ReturnType<typeof supabase.from>)
            .select('product_id')
            .eq('user_id', userId)
            .in('product_id', productIds)

        const likedProductIds = new Set(
            (userLikes as ProductLike[] | null)?.map((like) => like.product_id) || []
        )

        // Transform the data to match Product interface
        const products: Product[] = (data as ProductWithLikes[]).map((p) => ({
            id: p.id,
            user_id: p.user_id,
            name: p.name,
            description: p.description,
            price: p.price,
            share_id: p.share_id,
            image_urls: p.image_urls,
            created_at: p.created_at,
            category: p.category,
            tags: p.tags,
            likes_count: p.likes?.[0]?.count || 0,
            has_liked: likedProductIds.has(p.id)
        }))
        return { data: products, error }
    }

    return { data: data as Product[] | null, error }
}

// Get a product by ID
export async function getProductById(productId: string): Promise<ProductResult> {
    const supabase = createBrowserClient()

    const { data, error } = await (supabase.from('products') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('id', productId)
        .single()

    return { data: data as Product | null, error }
}

// Get a product by share ID (for public access)
export async function getProductByShareId(shareId: string): Promise<ProductResult> {
    const supabase = createBrowserClient()

    const { data, error } = await (supabase.from('products') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('share_id', shareId)
        .single()

    return { data: data as Product | null, error }
}

// Update a product
export async function updateProduct(
    productId: string,
    updates: ProductUpdate
): Promise<ProductResult> {
    const supabase = createBrowserClient()

    const { data, error } = await (supabase.from('products') as ReturnType<typeof supabase.from>)
        .update(updates)
        .eq('id', productId)
        .select()
        .single()

    return { data: data as Product | null, error }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<MutationResult> {
    const supabase = createBrowserClient()

    const { error } = await (supabase.from('products') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('id', productId)

    return { error }
}

// Toggle product like
export async function toggleProductLike(userId: string, productId: string): Promise<LikeResult> {
    const supabase = createBrowserClient()

    // Check if like exists
    const { data: existingLike } = await (supabase.from('product_likes') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()

    if (existingLike) {
        // Unlike
        const { error } = await (supabase.from('product_likes') as ReturnType<typeof supabase.from>)
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
        return { error, liked: false }
    } else {
        // Like
        const { error } = await (supabase.from('product_likes') as ReturnType<typeof supabase.from>)
            .insert({ user_id: userId, product_id: productId })
        return { error, liked: true }
    }
}

// Export the type for use in other files
export type { ProductRow, ProductInsert, ProductUpdate, ProductLikeRow }
