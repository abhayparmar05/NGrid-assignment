import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getUserProducts,
    getProductById,
    getProductByShareId,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductLike,
    type Product,
} from '@/supabase/services/products'
import { Database } from '@/supabase/types'

type ProductUpdate = Database['public']['Tables']['products']['Update']

// Query keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (userId: string, page: number, category?: string) =>
        [...productKeys.lists(), userId, page, category] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
    byShareId: (shareId: string) => [...productKeys.all, 'share', shareId] as const,
}

// Hook to fetch user products with pagination and filtering
export function useUserProducts(
    userId: string | undefined,
    page: number = 1,
    category?: string
) {
    return useQuery({
        queryKey: productKeys.list(userId || '', page, category),
        queryFn: async () => {
            if (!userId) return []
            const { data, error } = await getUserProducts(userId, page, 12, category)
            if (error) throw error
            return data || []
        },
        enabled: !!userId,
    })
}

// Hook to fetch a single product by ID
export function useProduct(productId: string | undefined) {
    return useQuery({
        queryKey: productKeys.detail(productId || ''),
        queryFn: async () => {
            if (!productId) return null
            const { data, error } = await getProductById(productId)
            if (error) throw error
            return data
        },
        enabled: !!productId,
    })
}

// Hook to fetch a product by share ID (for public pages)
export function useProductByShareId(shareId: string | undefined) {
    return useQuery({
        queryKey: productKeys.byShareId(shareId || ''),
        queryFn: async () => {
            if (!shareId) return null
            const { data, error } = await getProductByShareId(shareId)
            if (error) throw error
            return data
        },
        enabled: !!shareId,
    })
}

// Hook for creating a product
export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            userId,
            name,
            description,
            price,
            imageUrls,
            category,
            tags,
        }: {
            userId: string
            name: string
            description: string
            price: number
            imageUrls: string[]
            category?: string
            tags?: string[]
        }) => {
            const { data, error } = await createProduct(
                userId,
                name,
                description,
                price,
                imageUrls,
                category,
                tags
            )
            if (error) throw error
            return data
        },
        onSuccess: () => {
            // Invalidate product lists to refetch
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
        },
    })
}

// Hook for updating a product
export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            productId,
            updates,
        }: {
            productId: string
            updates: ProductUpdate
        }) => {
            const { data, error } = await updateProduct(productId, updates)
            if (error) throw error
            return data
        },
        onSuccess: (data) => {
            if (data) {
                // Update the cache for this specific product
                queryClient.setQueryData(productKeys.detail(data.id), data)
            }
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
        },
    })
}

// Hook for deleting a product
export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (productId: string) => {
            const { error } = await deleteProduct(productId)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() })
        },
    })
}

// Hook for toggling product like
export function useToggleLike() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            userId,
            productId,
        }: {
            userId: string
            productId: string
        }) => {
            const { error, liked } = await toggleProductLike(userId, productId)
            if (error) throw error
            return { liked, productId }
        },
        onMutate: async ({ productId }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: productKeys.lists() })

            // Snapshot the previous value
            const previousProducts = queryClient.getQueriesData({ queryKey: productKeys.lists() })

            // Optimistically update all product lists
            queryClient.setQueriesData(
                { queryKey: productKeys.lists() },
                (old: Product[] | undefined) => {
                    if (!old) return old
                    return old.map((p) => {
                        if (p.id === productId) {
                            return {
                                ...p,
                                has_liked: !p.has_liked,
                                likes_count: (p.likes_count || 0) + (p.has_liked ? -1 : 1),
                            }
                        }
                        return p
                    })
                }
            )

            return { previousProducts }
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousProducts) {
                context.previousProducts.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data)
                })
            }
        },
    })
}
