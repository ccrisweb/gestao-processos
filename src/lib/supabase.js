
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
        // Mock for UI testing
        const mockUser = { id: 'mock-user', email: 'demo@sistema.com' }
        let mockSession = null

        // Try to recover session from storage (simple mock)
        try {
            const stored = localStorage.getItem('sb-mock-session')
            if (stored) {
                const parsed = JSON.parse(stored)
                if (parsed && parsed.user) mockSession = parsed
            }
        } catch { }

        return {
            auth: {
                getSession: async () => ({ data: { session: mockSession }, error: null }),
                onAuthStateChange: (callback) => {
                    // Immediate callback with current state
                    callback('SIGNED_IN', mockSession)
                    return { data: { subscription: { unsubscribe: () => { } } } }
                },
                signInWithPassword: async ({ email }) => {
                    mockSession = { user: { ...mockUser, email }, access_token: 'mock' }
                    localStorage.setItem('sb-mock-session', JSON.stringify(mockSession))
                    return { data: { session: mockSession }, error: null }
                },
                signOut: async () => {
                    mockSession = null
                    localStorage.removeItem('sb-mock-session')
                    return { error: null }
                }
            },
            from: (table) => ({
                select: async () => ({ data: [], error: null, count: 0 }),
                upsert: async () => ({ data: [], error: null }),
                order: () => ({ data: [], error: null })
            })
        }
    }
})()

