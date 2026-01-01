import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '../types'

// Create a typed Supabase client for browser usage
export function createBrowserClient() {
    return createClientComponentClient<Database>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    })
}

// Export the client type for use in other files
export type TypedSupabaseClient = ReturnType<typeof createBrowserClient>

// Export Database types for reuse
export type { Database }

