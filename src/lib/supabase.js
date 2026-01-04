
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found in environment variables.')
}

export const supabase = (() => {
    try {
        if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
            throw new Error('Invalid Supabase URL')
        }
        return createClient(supabaseUrl, supabaseKey)
    } catch (e) {
        console.warn('Supabase not initialized:', e.message)
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signInWithPassword: async () => ({ error: { message: 'Supabase não configurado (verifique .env)' } }),
                signOut: async () => ({})
            },
            from: () => ({
                select: async () => ({ data: [], error: null }),
                upsert: async () => ({ data: null, error: null })
            })
        }
    }
})()
