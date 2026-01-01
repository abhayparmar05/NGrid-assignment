import { z } from 'zod'

/**
 * Environment variable schema validation using Zod.
 * This ensures all required environment variables are present
 * and correctly formatted at build/runtime.
 */

const envSchema = z.object({
    // Supabase Configuration
    NEXT_PUBLIC_SUPABASE_URL: z
        .string()
        .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z
        .string()
        .min(1, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is required'),

    // Node environment
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
})

// Type inference from schema
export type Env = z.infer<typeof envSchema>

/**
 * Validates and returns environment variables.
 * Throws a descriptive error if validation fails.
 */
function validateEnv(): Env {
    const parsed = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
        NODE_ENV: process.env.NODE_ENV,
    })

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:')
        console.error(parsed.error.flatten().fieldErrors)
        throw new Error('Invalid environment variables. Check the console for details.')
    }

    return parsed.data
}

// Export validated environment variables
export const env = validateEnv()

// Export individual variables for convenience
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
export const NODE_ENV = env.NODE_ENV
export const IS_PRODUCTION = env.NODE_ENV === 'production'

