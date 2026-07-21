import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const finishSignIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      if (session) {
        navigate('/dashboard', { replace: true })
        return
      }

      navigate('/login', { replace: true })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      }
    })

    finishSignIn()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-forge-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-forge-purple/30 border-t-forge-purple" />
        <p className="text-sm text-slate-400">Completing sign-in…</p>
      </div>
    </div>
  )
}
