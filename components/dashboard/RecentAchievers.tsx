'use client'

import type { Achiever } from './types'

interface Props {
  achievers: Achiever[]
}

const badgeEmoji: Record<string, string> = {
  gold: '🏆', silver: '🥈', bronze: '🥉', special: '⭐',
}

const badgeStyle: Record<string, string> = {
  gold:    'bg-amber-50 text-amber-700',
  silver:  'bg-gray-100 text-gray-600',
  bronze:  'bg-orange-50 text-orange-700',
  special: 'bg-purple-50 text-purple-700',
}

export default function RecentAchievers({ achievers }: Props) {
  if (achievers.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <h2 className="font-bold text-gray-900">Recent Achievers</h2>
        <span className="text-xs text-gray-400">{achievers.length} shown</span>
      </div>
      <div className="divide-y divide-gray-50">
        {achievers.map(a => (
          <div key={a._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
            <span className="text-xl flex-shrink-0">{badgeEmoji[a.badge] || '🎖'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{a.userId?.name}</p>
              <p className="text-xs text-gray-400 truncate">{a.title}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${badgeStyle[a.badge] || 'bg-gray-100 text-gray-600'}`}>
              {a.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
