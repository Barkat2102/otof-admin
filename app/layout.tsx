import './globals.css'
import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ToastProvider'

export const metadata: Metadata = {
  title: 'One Team One Foundation - Admin',
  description: 'Admin Panel for One Team One Foundation NGO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-light text-dark">
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
