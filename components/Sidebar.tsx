'use client'

import { useAuthStore } from '@/lib/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/lib/authService'
import { useState } from 'react'
import Link from 'next/link'
import { useToastStore } from '@/lib/toastStore'
import {
  FiGrid, FiUsers, FiActivity, FiBarChart2, FiSettings,
  FiLogOut, FiMenu, FiX, FiShield, FiFolder, FiFlag,
  FiAward, FiTrendingUp,
} from 'react-icons/fi'

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',  icon: FiGrid,       href: '/'            },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users',      icon: FiUsers,      href: '/users'       },
      { label: 'Projects',   icon: FiFolder,     href: '/projects'    },
      { label: 'Milestones', icon: FiFlag,       href: '/milestones'  },
      { label: 'Achievers',  icon: FiAward,      href: '/achievers'   },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Progress',   icon: FiTrendingUp, href: '/progress'    },
      { label: 'Analytics',  icon: FiActivity,   href: '/activities'  },
      { label: 'Reports & Analytics', icon: FiBarChart2, href: '/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',   icon: FiSettings,   href: '/settings'    },
    ],
  },
]

export function Sidebar() {
  const { logout, adminEmail, adminName } = useAuthStore()
  const router   = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { show } = useToastStore()

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    show('logout')
    setTimeout(() => router.push('/login'), 1500)
  }

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            <FiShield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight">OTOF Admin</p>
            <p className="text-[10px] text-slate-500 font-medium">One Team One Foundation</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5 flex-shrink-0" />

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {menuGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, href }) => {
                const active = pathname === href
                return (
                  <Link key={label} href={href} onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(124,58,237,0.15))',
                      boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)',
                    } : {}}>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-all ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5 flex-shrink-0" />

      {/* User + Logout */}
      <div className="px-3 py-4 flex-shrink-0 space-y-1">
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            {(adminName || adminEmail || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
              {adminName || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all group">
          <FiLogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl text-white shadow-brand"
        style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
        {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>

      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-[264px] flex-shrink-0 sticky top-0 h-screen sidebar-bg">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)} />
        <aside className={`absolute top-0 left-0 h-full w-[264px] sidebar-bg transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <NavContent />
        </aside>
      </div>
    </>
  )
}
