'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getProductById, updateProduct, Product } from '@/supabase/services/products'
import ProductForm from '@/components/ProductForm'
import Link from 'next/link'

export default function EditProductPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const productId = params.id as string

    const fetchProduct = useCallback(async () => {
        const { data, error } = await getProductById(productId)

        if (error || !data) {
            setError('Product not found or you do not have permission to edit it')
            setLoading(false)
            return
        }

        // Verify ownership
        if (data.user_id !== user?.id) {
            setError('You do not have permission to edit this product')
            setLoading(false)
            return
        }

        setProduct(data)
        setLoading(false)
    }, [productId, user?.id])

    useEffect(() => {
        if (user) {
            const loadData = async () => {
                await fetchProduct()
            }
            loadData()
        }
    }, [user, productId, fetchProduct])


    const handleUpdateProduct = async (productData: {
        name: string
        description: string
        price: number
        image_urls: string[]
    }) => {
        const { error } = await updateProduct(productId, productData)

        if (error) {
            alert('Failed to update product')
        } else {
            router.push('/dashboard')
        }
    }

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
                <div className="card text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="text-gray-400 mb-6">{error || 'Product not found'}</p>
                    <Link href="/dashboard" className="btn-primary inline-block">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Edit Product</h1>
                <p className="text-gray-400">Update your product details</p>
            </div>

            <div className="card">
                <ProductForm
                    initialData={product}
                    onSubmit={handleUpdateProduct}
                    userId={user?.id || ''}
                    submitLabel="Update Product"
                />
            </div>
        </div>
    )
}
