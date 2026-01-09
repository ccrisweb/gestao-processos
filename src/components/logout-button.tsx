'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function LogoutButton() {
  const navigate = useNavigate()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  return <Button onClick={logout}>Logout</Button>
}
