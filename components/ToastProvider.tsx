'use client'

import dynamic from 'next/dynamic'

// dynamic import prevents SSR hydration mismatch
const Toast = dynamic(() => import('./Toast').then((m) => m.Toast), { ssr: false })

export function ToastProvider() {
  return <Toast />
}
