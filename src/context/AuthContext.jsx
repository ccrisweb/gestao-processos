
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState(null)

    useEffect(() => {
        let mounted = true
        // Check active sessions and sets the user
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                setSession(session)
                setUser(session?.user ?? null)
                if (session?.user) await fetchRole(session.user.id)
            } catch (error) {
                console.error('Auth initialization error:', error.message)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Safety timeout to prevent white screen
        const timer = setTimeout(() => {
            if (mounted) setLoading(false)
        }, 2000)

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                await fetchRole(session.user.id)
            } else {
                setRole(null)
            }
            setLoading(false)
        })

        return () => {
            mounted = false
            clearTimeout(timer)
            subscription.unsubscribe()
        }
    }, [])

    const fetchRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (data) setRole(data.role)
        } catch (error) {
            console.error('Error fetching role:', error)
        }
    }

    const value = {
        user,
        role,
        session,
        loading,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signUp: (data) => supabase.auth.signUp(data),
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
