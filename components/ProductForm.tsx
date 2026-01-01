'use client'

import { useState } from 'react'
import { uploadProductImage } from '@/supabase/services/products'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface ProductFormProps {
    initialData?: {
        name: string
        description: string
        price: number
        image_urls: string[]
        category?: string | null
        tags?: string[] | null
    }
    onSubmit: (data: {
        name: string
        description: string
        price: number
        image_urls: string[]
        category: string
        tags: string[]
    }) => Promise<void>
    userId: string
    submitLabel?: string
}

export default function ProductForm({ initialData, onSubmit, userId, submitLabel = 'Create Product' }: ProductFormProps) {
    const [name, setName] = useState(initialData?.name || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [price, setPrice] = useState(initialData?.price || 0)
    const [category, setCategory] = useState(initialData?.category || 'Electronics')
    const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
    const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_urls || [])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        setError('')

        const newUrls: string[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload only image files')
                continue
            }

            const url = await uploadProductImage(file, userId)
            if (url) {
                newUrls.push(url)
            } else {
                setError('Failed to upload some images')
            }
        }

        setImageUrls([...imageUrls, ...newUrls])
        setUploading(false)
    }

    const removeImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (imageUrls.length === 0) {
            setError('Please upload at least one image')
            setLoading(false)
            return
        }

        try {
            await onSubmit({
                name,
                description,
                price,
                image_urls: imageUrls,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean)
            })
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg animate-scale-in">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field min-h-[120px]"
                    placeholder="Enter product description"
                    required
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field"
                    >
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Home">Home</option>
                        <option value="Books">Books</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        id="tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="input-field"
                        placeholder="e.g. sale, winter, featured"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Price ($)
                </label>
                <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={isNaN(price) ? '' : price}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setPrice(isNaN(val) ? 0 : val)
                    }}
                    className="input-field"
                    placeholder="0.00"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Images
                </label>

                {/* Image Preview */}
                {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <Image
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    width={128}
                                    height={128}
                                    className="w-full h-32 object-cover rounded-lg border border-card-border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-card-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors duration-300">
                    <div className="flex flex-col items-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">
                            {uploading ? 'Uploading...' : 'Click to upload images'}
                        </span>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            <button
                type="submit"
                disabled={loading || uploading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving...' : submitLabel}
            </button>
        </form>
    )
}
