'use client'

import { useAuthStore } from '@/lib/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { authService } from '@/lib/authService'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { setAuth, logout } = useAuthStore()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    authService.getProfile()
      .then((admin) => {
        setAuth(true, admin.email, admin.name, admin.role)
        setChecking(false)
      })
      .catch(() => {
        logout()
        router.replace('/login')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-light">
        <div className="border-4 border-primary border-t-transparent rounded-full w-10 h-10 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
