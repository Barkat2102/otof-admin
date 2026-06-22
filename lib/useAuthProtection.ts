'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from './authStore'
import { authService } from './authService'

const SESSION_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '900000', 10)

export function useAuthProtection() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuthStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(async () => {
    await authService.logout() // backend clears HttpOnly cookies
    logout()
    router.push('/login')
  }, [logout, router])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(handleLogout, SESSION_TIMEOUT)
  }, [handleLogout])

  useEffect(() => {
    if (!isAuthenticated || pathname === '/login') return

    resetTimer()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => document.addEventListener(e, resetTimer))

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, pathname, resetTimer])

  return {}
}
