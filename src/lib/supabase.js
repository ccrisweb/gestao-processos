
import { createClient } from '@supabase/supabase-js'

// Fallback to project credentials if env vars are missing
// These are safe to be public (anon key)
const PROJECT_URL = 'https://itkxfqmsgroyxdoalvph.supabase.co'
const PROJECT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a3hmcW1zZ3JveXhkb2FsdnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzgxMzcsImV4cCI6MjA4MzExNDEzN30.XTkvG9MP-XZzsaH4D9FUbpa91TLOMDKsD3FP-SFLCE0'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PROJECT_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PROJECT_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase credentials missing!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
