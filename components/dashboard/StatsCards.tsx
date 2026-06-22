'use client'

import { FiUsers, FiFolder, FiFlag, FiAward, FiArrowUpRight } from 'react-icons/fi'
import type { Stats } from './types'

interface Props {
  stats: Stats | null
  loading: boolean
}

export default function StatsCards({ stats, loading }: Props) {
  const cards = stats ? [
    { title: 'Total Users',  value: stats.totalUsers,      change: '+12%',                          icon: FiUsers,  bg: 'bg-blue-50',    text: 'text-blue-600',    grad: 'from-blue-500 to-cyan-500'      },
    { title: 'Projects',     value: stats.totalProjects,   change: `${stats.activeProjects} active`, icon: FiFolder, bg: 'bg-violet-50',  text: 'text-violet-600',  grad: 'from-violet-500 to-purple-600'  },
    { title: 'Milestones',   value: stats.totalMilestones, change: `${stats.completedMilestones} done`, icon: FiFlag, bg: 'bg-emerald-50', text: 'text-emerald-600', grad: 'from-emerald-500 to-teal-500'  },
    { title: 'Achievers',    value: stats.totalAchievers,  change: 'badges',                        icon: FiAward,  bg: 'bg-amber-50',   text: 'text-amber-600',   grad: 'from-amber-500 to-orange-500'   },
  ] : []

  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
            <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4" />
            <div className="h-7 bg-gray-100 rounded-lg w-16 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map(s => {
        const Icon = s.icon
        return (
          <div key={s.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`${s.bg} p-2.5 rounded-xl`}>
                <Icon className={`${s.text} w-5 h-5`} />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <FiArrowUpRight className="w-3 h-3" />{s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.title}</p>
            <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${s.grad}`} style={{ width: '65%' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
