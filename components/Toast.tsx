'use client'

import { useEffect, useRef } from 'react'
import { useToastStore } from '@/lib/toastStore'

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const LOGOUT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)
const USER_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
)
const EDIT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
  </svg>
)
const TRASH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const CONFIG = {
  login: {
    icon: CHECK, iconBg: 'bg-emerald-500',
    accent: 'from-emerald-500 to-teal-500', progressColor: 'bg-emerald-400',
    title: 'Welcome back!',
    subtitle: (name: string) => name ? `Signed in as ${name}` : 'You have successfully signed in.',
    badge: 'Login Successful', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  logout: {
    icon: LOGOUT_ICON, iconBg: 'bg-violet-500',
    accent: 'from-violet-500 to-purple-600', progressColor: 'bg-violet-400',
    title: 'See you soon!',
    subtitle: () => 'You have been securely signed out.',
    badge: 'Logout Successful', badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  userCreated: {
    icon: USER_ICON, iconBg: 'bg-blue-500',
    accent: 'from-blue-500 to-cyan-500', progressColor: 'bg-blue-400',
    title: 'User Created!',
    subtitle: (name: string) => name ? `${name} has been added successfully.` : 'New user added successfully.',
    badge: 'User Created', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  userUpdated: {
    icon: EDIT_ICON, iconBg: 'bg-amber-500',
    accent: 'from-amber-500 to-orange-500', progressColor: 'bg-amber-400',
    title: 'User Updated!',
    subtitle: (name: string) => name ? `${name}'s details have been updated.` : 'User details updated successfully.',
    badge: 'User Updated', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  userDeleted: {
    icon: TRASH_ICON, iconBg: 'bg-red-500',
    accent: 'from-red-500 to-rose-600', progressColor: 'bg-red-400',
    title: 'User Deleted',
    subtitle: (name: string) => name ? `${name} has been removed.` : 'User has been removed.',
    badge: 'User Deleted', badgeBg: 'bg-red-50 text-red-700 border-red-200',
  },
}

const DURATION = 3000

export function Toast() {
  const visible = useToastStore((s) => s.visible)
  const type    = useToastStore((s) => s.type)
  const name    = useToastStore((s) => s.name)
  const hide    = useToastStore((s) => s.hide)

  const timerRef    = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideRef     = useRef(hide)
  hideRef.current   = hide

  useEffect(() => {
    if (!visible) return
    if (timerRef.current) clearTimeout(timerRef.current)

    if (progressRef.current) {
      progressRef.current.style.transition = 'none'
      progressRef.current.style.width = '100%'
      void progressRef.current.offsetWidth
      progressRef.current.style.transition = `width ${DURATION}ms linear`
      progressRef.current.style.width = '0%'
    }

    timerRef.current = setTimeout(() => hideRef.current(), DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [visible])

  const cfg = CONFIG[type]

  return (
    <div
      aria-live="polite"
      className={`fixed top-6 right-6 z-[9999] transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}
    >
      <div className="relative w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className={`h-1 w-full bg-gradient-to-r ${cfg.accent}`} />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`${cfg.iconBg} text-white rounded-xl p-2.5 flex-shrink-0 shadow-lg`}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-bold text-gray-900 text-base leading-tight">{cfg.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badgeBg}`}>
                  {cfg.badge}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-snug truncate">
                {cfg.subtitle(name)}
              </p>
            </div>
            <button onClick={() => hideRef.current()}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-0.5"
              aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div ref={progressRef} className={`h-full ${cfg.progressColor} w-full`} />
        </div>
      </div>
    </div>
  )
}
