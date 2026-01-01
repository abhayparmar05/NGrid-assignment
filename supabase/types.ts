export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            cart_items: {
                Row: {
                    created_at: string | null
                    id: string
                    product_id: string
                    quantity: number
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    product_id: string
                    quantity?: number
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    product_id?: string
                    quantity?: number
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "cart_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_likes: {
                Row: {
                    created_at: string | null
                    product_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    product_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    product_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_likes_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    category: string | null
                    created_at: string | null
                    description: string
                    id: string
                    image_urls: string[]
                    name: string
                    price: number
                    share_id: string
                    tags: string[] | null
                    user_id: string
                }
                Insert: {
                    category?: string | null
                    created_at?: string | null
                    description: string
                    id?: string
                    image_urls?: string[]
                    name: string
                    price: number
                    share_id: string
                    tags?: string[] | null
                    user_id: string
                }
                Update: {
                    category?: string | null
                    created_at?: string | null
                    description?: string
                    id?: string
                    image_urls?: string[]
                    name?: string
                    price?: number
                    share_id?: string
                    tags?: string[] | null
                    user_id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Simplified type helpers
type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
