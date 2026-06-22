// 'use client'

// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { CustomTooltip } from './CustomTooltip'
// import type { ProjectChartData } from './types'

// interface Props {
//   data: ProjectChartData[]
// }

// export default function ProjectCompletionRate({ data }: Props) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//       <div className="mb-5">
//         <h2 className="font-bold text-gray-900">Project Completion Rate</h2>
//         <p className="text-xs text-gray-400 mt-0.5">Progress % across all projects</p>
//       </div>

//       {data.length === 0 ? (
//         <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No projects yet</div>
//       ) : (
//         <ResponsiveContainer width="100%" height={200}>
//           <AreaChart data={data}>
//             <defs>
//               <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
//                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//             <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
//             <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
//               domain={[0, 100]} tickFormatter={v => `${v}%`} />
//             <Tooltip content={<CustomTooltip />} />
//             <Area type="monotone" dataKey="progress" name="progress"
//               stroke="#6366f1" strokeWidth={2.5}
//               fill="url(#progressGrad)"
//               dot={{ fill: '#6366f1', r: 4 }} />
//           </AreaChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   )
// }


'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { FiActivity } from 'react-icons/fi'
import { CustomTooltip } from './CustomTooltip'
import type { ProjectChartData } from './types'

interface Props {
  data: ProjectChartData[]
}

export default function ProjectCompletionRate({ data }: Props) {

  const avg =
    data.length > 0
      ? (data.reduce((acc, d) => acc + d.progress, 0) / data.length).toFixed(1)
      : 0

  const best = data.reduce((a, b) => (a.progress > b.progress ? a : b), data[0] || {})
  const worst = data.reduce((a, b) => (a.progress < b.progress ? a : b), data[0] || {})

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            Project Completion Rate
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Progress % across all projects
          </p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg">
          <FiActivity className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      {/* STATS */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Stat label="Average" value={`${avg}%`} highlight />
          <Stat label="Best" value={`${best?.progress || 0}%`} />
          <Stat label="Lowest" value={`${worst?.progress || 0}%`} />
        </div>
      )}

      {/* CHART */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-gray-400 text-sm">
          <FiActivity className="mb-2 opacity-40" />
          No project data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="progress"
              name="Completion"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#progressGrad)"
              dot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

/* reusable stat */
function Stat({ label, value, highlight = false }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  )
}