'use client'

import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/authStore'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router      = useRouter()
  const { setAuth } = useAuthStore()
  const { show }    = useToastStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { admin } = await authService.login(email, password)
      setAuth(true, admin.email, admin.name, admin.role)
      show('login', admin.name || admin.email)
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #080b14 0%, #0f1117 40%, #13111f 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[1px] opacity-[0.08]"
          style={{ background: 'linear-gradient(90deg, transparent, #6366f1, transparent)' }} />
      </div>

      <div className="w-full max-w-[400px] relative z-10">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
            <FiShield className="w-7 h-7 text-white" />
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)', borderRadius: 'inherit' }} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">One Team One Foundation</h1>
          <p className="text-slate-500 text-sm mt-1.5">Admin Portal · Secure Access</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

          {/* Top accent line */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #6366f1, #7c3aed, transparent)' }} />

          <div className="p-7">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your admin account</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@example.com" required
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 rounded-xl focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(99,102,241,0.08)' }}
                    onBlur={e  => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 rounded-xl focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(99,102,241,0.08)' }}
                    onBlur={e  => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>

              {/* Sign In */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <FiArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 One Team One Foundation · All rights reserved
        </p>
      </div>
    </div>
  )
}
