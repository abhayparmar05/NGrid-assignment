import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/supabase/types'
import ImageCarousel from '@/components/ImageCarousel'
import AddToCartButton from '@/components/AddToCartButton'

// Product type from database
type ProductRow = Database['public']['Tables']['products']['Row']

// Fetch product on the server
async function getProductByShareId(shareId: string): Promise<ProductRow | null> {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('share_id', shareId)
        .single()

    if (error || !data) return null
    return data
}

interface PageProps {
    params: Promise<{ shareId: string }>
}

export default async function PublicProductPage({ params }: PageProps) {
    const { shareId } = await params
    const product = await getProductByShareId(shareId)

    if (!product) {
        notFound()
    }

    // TypeScript now knows product is ProductRow here
    const { id, name, description, price, image_urls, category, tags } = product

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-2 gap-12 animate-fade-in">
                {/* Image Carousel */}
                <div>
                    <ImageCarousel images={image_urls} alt={name} />
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    {category && (
                        <span className="text-sm text-primary mb-2">{category}</span>
                    )}
                    <h1 className="text-4xl font-bold mb-4">{name}</h1>

                    <div className="text-3xl font-bold gradient-text mb-6">
                        ${price.toFixed(2)}
                    </div>

                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold mb-3">Description</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {description}
                        </p>
                    </div>

                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {tags.map((tag) => (
                                <span key={tag} className="text-xs bg-card-border px-3 py-1 rounded-full text-gray-300">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto space-y-4">
                        {/* Client component for add to cart */}
                        <AddToCartButton productId={id} />

                        <Link
                            href="/"
                            className="w-full btn-secondary flex items-center justify-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
