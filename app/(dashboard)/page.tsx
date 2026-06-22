'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/authStore'
import { authService } from '@/lib/authService'
import { track, identifyAdmin } from '@/lib/mixpanel'
import { FiRefreshCw } from 'react-icons/fi'

import StatsCards            from '@/components/dashboard/StatsCards'
import ProjectFundingProgress from '@/components/dashboard/ProjectFundingProgress'
import ProjectsByCategory    from '@/components/dashboard/ProjectsByCategory'
import ProjectCompletionRate from '@/components/dashboard/ProjectCompletionRate'
import ProjectStatus         from '@/components/dashboard/ProjectStatus'
import BadgeDistribution     from '@/components/dashboard/BadgeDistribution'
import RecentAchievers       from '@/components/dashboard/RecentAchievers'

import type { Stats, Project, Achiever } from '@/components/dashboard/types'

export default function DashboardPage() {
  const { adminEmail, adminName } = useAuthStore()
  const api = authService.getApi()

  const [stats,    setStats]    = useState<Stats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [achievers,setAchievers]= useState<Achiever[]>([])
  const [loading,  setLoading]  = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, p, a] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/admin/projects'),
        api.get('/admin/achievers'),
      ])

      const allProjects: Project[]   = p.data.projects
      const allAchievers: Achiever[] = a.data.achievers

      const msData = await Promise.all(
        allProjects.map(pr =>
          api.get(`/admin/milestones/project/${pr._id}`)
            .then(r => r.data.milestones as { status: string }[])
            .catch(() => [])
        )
      )
      const allMilestones = msData.flat()

      setStats({
        totalUsers:          u.data.pagination.total,
        totalProjects:       allProjects.length,
        totalMilestones:     allMilestones.length,
        totalAchievers:      allAchievers.length,
        activeProjects:      allProjects.filter(p => p.status === 'active').length,
        completedMilestones: allMilestones.filter(m => m.status === 'completed').length,
      })
      setProjects(allProjects)
      setAchievers(allAchievers.slice(0, 5))

      track('dashboard_viewed', { admin: adminEmail })
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAll()
    if (adminEmail) identifyAdmin(adminEmail, adminName || undefined)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived chart data ──────────────────────────────────────────────────
  const projectChartData = projects.slice(0, 6).map(p => ({
    name:     p.title.length > 14 ? p.title.slice(0, 14) + '…' : p.title,
    raised:   p.raisedAmount,
    target:   p.targetAmount,
    progress: p.progress,
  }))

  const categoryData = Object.entries(
    projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const statusData = [
    { name: 'Active',    value: projects.filter(p => p.status === 'active').length    },
    { name: 'Upcoming',  value: projects.filter(p => p.status === 'upcoming').length  },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
  ].filter(d => d.value > 0)

  const badgeData = ['gold', 'silver', 'bronze', 'special'].map(b => ({
    name:  b.charAt(0).toUpperCase() + b.slice(1),
    count: achievers.filter(a => a.badge === b).length,
  }))

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, <span className="text-gradient">{adminName || adminEmail} 👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s your organization analytics overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Row 1 — Funding Progress + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectFundingProgress data={projectChartData} />
        </div>
        <ProjectsByCategory data={categoryData} />
      </div>

      {/* Row 2 — Completion Rate + Status + Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectCompletionRate data={projectChartData} />
        </div>
        <div className="space-y-5">
          <ProjectStatus      data={statusData} />
          <BadgeDistribution  data={badgeData} total={achievers.length} />
        </div>
      </div>

      {/* Recent Achievers */}
      <RecentAchievers achievers={achievers} />

    </div>
  )
}
