'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/authService'
import { track } from '@/lib/mixpanel'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart,
} from 'recharts'
import {
  FiUsers, FiFolder, FiFlag, FiAward,
  FiTrendingUp, FiRefreshCw, FiActivity,
  FiCheckCircle, FiClock, FiTarget,
} from 'react-icons/fi'

interface Project  { _id: string; title: string; category: string; targetAmount: number; raisedAmount: number; progress: number; status: string; assignedUsers: { _id: string }[] }
interface Milestone { _id: string; status: string; projectId: string; title: string; targetValue: number; currentValue: number }
interface Achiever  { _id: string; badge: string; userId: { name: string }; title: string; awardedAt: string }
interface User      { _id: string; name: string; email: string; createdAt: string }

const COLORS  = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs min-w-[120px]">
      <p className="font-bold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-bold" style={{ color: p.color }}>
            {p.name?.includes('₹') || p.name === 'Raised' || p.name === 'Target'
              ? `₹${Number(p.value).toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const api = authService.getApi()
  const [projects,   setProjects]   = useState<Project[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [achievers,  setAchievers]  = useState<Achiever[]>([])
  const [users,      setUsers]      = useState<User[]>([])
  const [loading,    setLoading]    = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, a, u] = await Promise.all([
        api.get('/admin/projects'),
        api.get('/admin/achievers'),
        api.get('/users?limit=100'),
      ])
      const allProjects: Project[]  = p.data.projects
      const allAchievers: Achiever[] = a.data.achievers
      const allUsers: User[]         = u.data.users

      const msData = await Promise.all(
        allProjects.map(pr =>
          api.get(`/admin/milestones/project/${pr._id}`)
            .then(r => r.data.milestones as Milestone[])
            .catch(() => [])
        )
      )

      setProjects(allProjects)
      setMilestones(msData.flat())
      setAchievers(allAchievers)
      setUsers(allUsers)
      track('analytics_viewed')
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Derived data ──
  const totalRaised   = projects.reduce((s, p) => s + p.raisedAmount, 0)
  const totalTarget   = projects.reduce((s, p) => s + p.targetAmount, 0)
  const overallPct    = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0
  const completedMs   = milestones.filter(m => m.status === 'completed').length
  const msCompletionPct = milestones.length > 0 ? Math.round((completedMs / milestones.length) * 100) : 0

  // Project progress chart
  const projectProgressData = projects.map(p => ({
    name:     p.title.length > 12 ? p.title.slice(0, 12) + '…' : p.title,
    raised:   p.raisedAmount,
    target:   p.targetAmount,
    progress: p.progress,
    users:    p.assignedUsers?.length || 0,
  }))

  // Category distribution
  const categoryData = Object.entries(
    projects.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  // Status distribution
  const statusData = [
    { name: 'Active',    value: projects.filter(p => p.status === 'active').length,    fill: '#10b981' },
    { name: 'Upcoming',  value: projects.filter(p => p.status === 'upcoming').length,  fill: '#f59e0b' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, fill: '#6366f1' },
  ].filter(d => d.value > 0)

  // Badge distribution
  const badgeData = ['gold','silver','bronze','special'].map((b, i) => ({
    name:  b.charAt(0).toUpperCase() + b.slice(1),
    count: achievers.filter(a => a.badge === b).length,
    fill:  COLORS[i],
  }))

  // Milestone status
  const msStatusData = [
    { name: 'Completed',   value: milestones.filter(m => m.status === 'completed').length,   fill: '#10b981' },
    { name: 'In Progress', value: milestones.filter(m => m.status === 'in_progress').length, fill: '#f59e0b' },
    { name: 'Pending',     value: milestones.filter(m => m.status === 'pending').length,     fill: '#e5e7eb' },
  ].filter(d => d.value > 0)

  // User growth by month (from createdAt)
  const userGrowth = MONTHS.map((month, i) => ({
    month,
    users: users.filter(u => new Date(u.createdAt).getMonth() === i).length,
  }))

  // Radial data for overview
  const radialData = [
    { name: 'Funding',    value: overallPct,      fill: '#6366f1' },
    { name: 'Milestones', value: msCompletionPct, fill: '#10b981' },
  ]

  const kpiCards = [
    { label: 'Total Users',       value: users.length,      icon: FiUsers,       color: 'text-blue-600',    bg: 'bg-blue-50'    },
    { label: 'Total Projects',    value: projects.length,   icon: FiFolder,      color: 'text-violet-600',  bg: 'bg-violet-50'  },
    { label: 'Milestones Done',   value: `${completedMs}/${milestones.length}`, icon: FiFlag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Badges Awarded',    value: achievers.length,  icon: FiAward,       color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Funds Raised',      value: `₹${(totalRaised/1000).toFixed(1)}k`, icon: FiTarget, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Overall Progress',  value: `${overallPct}%`,  icon: FiTrendingUp,  color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
  ]

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Loading analytics data...</p>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse h-64" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 md:p-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Complete organization analytics and insights</p>
        </div>
        <button onClick={fetchAll} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm card-hover">
              <div className={`${k.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`${k.color} w-5 h-5`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.label}</p>
            </div>
          )
        })}
      </div>

      {/* Overview Radial + User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Radial Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Overall Health</h2>
          <p className="text-xs text-gray-400 mb-4">Funding & milestone completion</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius={30} outerRadius={80}
              data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f3f4f6' }} />
              <Tooltip formatter={(v) => [`${v}%`]} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="text-center p-3 bg-indigo-50 rounded-xl">
              <p className="text-xl font-bold text-indigo-600">{overallPct}%</p>
              <p className="text-[10px] text-gray-500">Funding</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-xl font-bold text-emerald-600">{msCompletionPct}%</p>
              <p className="text-[10px] text-gray-500">Milestones</p>
            </div>
          </div>
        </div>

        {/* User Growth Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">User Growth</h2>
          <p className="text-xs text-gray-400 mb-4">New users registered per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#6366f1"
                strokeWidth={2.5} fill="url(#userGrad)" dot={{ fill: '#6366f1', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Funding ComposedChart + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Project Funding</h2>
              <p className="text-xs text-gray-400 mt-0.5">Raised (bar) vs Target (bar) vs Progress % (line)</p>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No projects yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={projectProgressData} barGap={3}>
                <defs>
                  <linearGradient id="raisedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={1}   />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="amount" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {/* Target bar — light background */}
                <Bar yAxisId="amount" dataKey="target" name="Target" fill="#e0e7ff" radius={[4,4,0,0]} barSize={18} />
                {/* Raised bar — gradient fill */}
                <Bar yAxisId="amount" dataKey="raised" name="Raised" fill="url(#raisedGrad)" radius={[4,4,0,0]} barSize={18} />
                {/* Progress line on secondary axis */}
                <Line yAxisId="pct" type="monotone" dataKey="progress" name="Progress %"
                  stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Category Split</h2>
          <p className="text-xs text-gray-400 mb-4">Projects by category</p>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [v, 'Projects']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categoryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Milestone Status + Project Status + Badge Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Milestone Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Milestone Status</h2>
          <p className="text-xs text-gray-400 mb-4">Completion breakdown</p>
          {msStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No milestones</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={msStatusData} cx="50%" cy="50%" outerRadius={55} paddingAngle={3} dataKey="value">
                    {msStatusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => [v, 'Milestones']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {msStatusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Project Status</h2>
          <p className="text-xs text-gray-400 mb-4">Active vs upcoming vs done</p>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No projects</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={55} paddingAngle={3} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => [v, 'Projects']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-3">
                {statusData.map(d => (
                  <div key={d.name} className="text-center">
                    <p className="text-xl font-bold" style={{ color: d.fill }}>{d.value}</p>
                    <p className="text-[10px] text-gray-400">{d.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Badge Distribution Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Badge Distribution</h2>
          <p className="text-xs text-gray-400 mb-4">Achiever badges breakdown</p>
          {achievers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No badges yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={badgeData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={v => [v, 'Badges']} />
                <Bar dataKey="count" name="Badges" radius={[0,4,4,0]}>
                  {badgeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Project Progress Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-1">Project Completion Rate</h2>
        <p className="text-xs text-gray-400 mb-4">Progress % and assigned users per project</p>
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No projects yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left"  type="monotone" dataKey="progress" name="Progress %" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="users"    name="Users"      stroke="#10b981" strokeWidth={2}   dot={{ fill: '#10b981', r: 3 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Achievers Table */}
      {achievers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">All Achievers</h2>
            <span className="text-xs text-gray-400">{achievers.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gray-50/80">
                  {['Member','Achievement','Badge','Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {achievers.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">{a.userId?.name}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-600">{a.title}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                        a.badge === 'gold'    ? 'bg-amber-50 text-amber-700'   :
                        a.badge === 'silver'  ? 'bg-gray-100 text-gray-600'    :
                        a.badge === 'bronze'  ? 'bg-orange-50 text-orange-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {['gold','silver','bronze','special'].includes(a.badge) ? ['🏆','🥈','🥉','⭐'][['gold','silver','bronze','special'].indexOf(a.badge)] : ''} {a.badge}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-400">
                      {new Date(a.awardedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
