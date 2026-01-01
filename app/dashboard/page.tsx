'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProducts, deleteProduct, createProduct, toggleProductLike, type Product } from '@/supabase/services/products'
import { addToCart, getCartItems } from '@/supabase/services/cart'
import Link from 'next/link'
import Image from 'next/image'
import { PlusIcon, TrashIcon, ShareIcon, PencilIcon, ShoppingCartIcon, CheckCircleIcon, ExclamationTriangleIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import ProductForm from '@/components/ProductForm'
import Modal from '@/components/Modal'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [addingToCart, setAddingToCart] = useState<string | null>(null)
    const [cartProductIds, setCartProductIds] = useState<Set<string>>(new Set())

    // Pagination and Filter states
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [category, setCategory] = useState('All')
    const [liking, setLiking] = useState<string | null>(null)

    // Modal states
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean
        title: string
        content: React.ReactNode
        type?: 'success' | 'error' | 'confirm'
    }>({
        isOpen: false,
        title: '',
        content: null
    })

    // Define fetch functions with useCallback before useEffect
    const fetchCart = useCallback(async () => {
        if (!user) return
        const { data } = await getCartItems(user.id)
        if (data) {
            const ids = new Set<string>(data.map((item: { product_id: string }) => item.product_id))
            setCartProductIds(ids)
        }
    }, [user])

    const fetchProducts = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const { data } = await getUserProducts(user.id, page, 12, category)
        if (data) {
            setProducts(data)
            setHasMore(data.length === 12)
        }
        setLoading(false)
    }, [user, page, category])

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login')
            return
        }

        if (!authLoading && user) {
            // Use async IIFE to handle data fetching properly
            const initData = async () => {
                await fetchProducts()
                await fetchCart()
            }
            initData()
        }
    }, [user, authLoading, router, fetchProducts, fetchCart])


    const handleCreateProduct = async (productData: {
        name: string
        description: string
        price: number
        image_urls: string[]
        category: string
        tags: string[]
    }) => {
        if (!user) return

        const { error } = await createProduct(
            user.id,
            productData.name,
            productData.description,
            productData.price,
            productData.image_urls,
            productData.category,
            productData.tags
        )

        if (!error) {
            setShowCreateForm(false)
            fetchProducts()
            setModalConfig({
                isOpen: true,
                title: 'Success',
                content: (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                        <p className="text-lg">Product created successfully!</p>
                        <button
                            onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                            className="btn-primary mt-6 w-full"
                        >
                            Close
                        </button>
                    </div>
                )
            })
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Product',
            content: (
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-error mx-auto mb-4" />
                    <p className="text-lg mb-6">Are you sure you want to delete this product?</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                setModalConfig(prev => ({ ...prev, isOpen: false }))
                                setDeleting(productId)
                                const { error } = await deleteProduct(productId)
                                if (!error) {
                                    fetchProducts()
                                }
                                setDeleting(null)
                            }}
                            className="btn-primary flex-1 bg-error border-error hover:bg-error/90"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )
        })
    }

    const handleAddToCart = async (productId: string) => {
        if (!user) return

        setAddingToCart(productId)
        const { error } = await addToCart(user.id, productId, 1)

        if (error) {
            setModalConfig({
                isOpen: true,
                title: 'Error',
                content: (
                    <div className="text-center">
                        <ExclamationTriangleIcon className="w-16 h-16 text-error mx-auto mb-4" />
                        <p className="text-lg">Failed to add to cart</p>
                        <button
                            onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                            className="btn-primary mt-6 w-full"
                        >
                            Close
                        </button>
                    </div>
                )
            })
        } else {
            fetchCart()
            setModalConfig({
                isOpen: true,
                title: 'Success',
                content: (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                        <p className="text-lg">Added to cart successfully!</p>
                        <button
                            onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                            className="btn-primary mt-6 w-full"
                        >
                            Close
                        </button>
                    </div>
                )
            })
        }
        setAddingToCart(null)
    }

    const handleToggleLike = async (productId: string) => {
        if (!user || liking) return
        setLiking(productId)

        // Optimistic update
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                return {
                    ...p,
                    has_liked: !p.has_liked,
                    likes_count: (p.likes_count || 0) + (p.has_liked ? -1 : 1)
                }
            }
            return p
        }))

        const { error } = await toggleProductLike(user.id, productId)

        if (error) {
            fetchProducts()
        }
        setLiking(null)
    }

    const copyShareLink = (shareId: string) => {
        const url = `${window.location.origin}/p/${shareId}`
        navigator.clipboard.writeText(url)
        setModalConfig({
            isOpen: true,
            title: 'Success',
            content: (
                <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <p className="text-lg">Share link copied to clipboard!</p>
                    <button
                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                        className="btn-primary mt-6 w-full"
                    >
                        Close
                    </button>
                </div>
            )
        })
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                maxWidth="max-w-md"
            >
                {modalConfig.content}
            </Modal>

            <Modal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                title="Create New Product"
                maxWidth="max-w-2xl"
            >
                <ProductForm
                    onSubmit={handleCreateProduct}
                    userId={user?.id || ''}
                    submitLabel="Create Product"
                />
            </Modal>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Your Products</h1>
                    <p className="text-gray-400">Manage your product listings</p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value)
                            setPage(1)
                        }}
                        className="bg-card border border-card-border rounded-lg px-4 py-2"
                    >
                        <option value="All">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Home">Home</option>
                        <option value="Books">Books</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>

                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-24 h-24 bg-card-border rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No products yet</h3>
                    <p className="text-gray-400 mb-6">Start by creating your first product</p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="card-interactive group">
                            <div className="relative mb-4 overflow-hidden rounded-lg">
                                <Image
                                    src={product.image_urls[0] || '/placeholder.png'}
                                    alt={product.name}
                                    width={400}
                                    height={192}
                                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full font-semibold">
                                    ${product.price.toFixed(2)}
                                </div>
                                {product.category && (
                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                                        {product.category}
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-2 line-clamp-1">{product.name}</h3>
                            <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>

                            <div className="flex gap-2 mb-4">
                                {product.tags?.map(tag => (
                                    <span key={tag} className="text-xs bg-card-border px-2 py-1 rounded-full text-gray-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/products/${product.id}`}
                                    className="flex-1 btn-secondary py-2 px-3 text-sm flex items-center justify-center gap-1"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                </Link>

                                <button
                                    onClick={() => handleToggleLike(product.id)}
                                    className="btn-secondary py-2 px-3 text-sm flex items-center gap-1 group/like"
                                    title={product.has_liked ? "Unlike" : "Like"}
                                >
                                    {product.has_liked ? (
                                        <HeartIconSolid className="w-4 h-4 text-error" />
                                    ) : (
                                        <HeartIcon className="w-4 h-4 group-hover/like:text-error" />
                                    )}
                                    <span>{product.likes_count || 0}</span>
                                </button>

                                <button
                                    onClick={() => copyShareLink(product.share_id)}
                                    className="btn-secondary py-2 px-3 text-sm"
                                    title="Copy share link"
                                >
                                    <ShareIcon className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={addingToCart === product.id || cartProductIds.has(product.id)}
                                    className="btn-secondary py-2 px-3 text-sm hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={cartProductIds.has(product.id) ? "Already in cart" : "Add to cart"}
                                >
                                    <ShoppingCartIcon className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={deleting === product.id}
                                    className="btn-secondary py-2 px-3 text-sm hover:bg-error/20 hover:border-error transition-colors"
                                    title="Delete product"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {products.length > 0 && (
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center text-gray-400">
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
