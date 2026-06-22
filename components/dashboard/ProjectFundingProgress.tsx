// 'use client'

// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
// import { FiTrendingUp } from 'react-icons/fi'
// import { CustomTooltip } from './CustomTooltip'
// import type { ProjectChartData } from './types'

// interface Props {
//   data: ProjectChartData[]
// }

// export default function ProjectFundingProgress({ data }: Props) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//       <div className="flex items-center justify-between mb-5">
//         <div>
//           <h2 className="font-bold text-gray-900">Project Funding Progress</h2>
//           <p className="text-xs text-gray-400 mt-0.5">Raised vs Target amount per project</p>
//         </div>
//         <FiTrendingUp className="w-5 h-5 text-indigo-400" />
//       </div>

//       {data.length === 0 ? (
//         <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No projects yet</div>
//       ) : (
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={data}>
//             <defs>
//               <linearGradient id="raisedAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
//                 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
//               </linearGradient>
//               <linearGradient id="targetAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.12} />
//                 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//             <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
//             <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
//               tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend wrapperStyle={{ fontSize: 11 }} />
//             <Area type="monotone" dataKey="target" name="Target"
//               stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 4"
//               fill="url(#targetAreaGrad)" dot={false} />
//             <Area type="monotone" dataKey="raised" name="Raised"
//               stroke="#6366f1" strokeWidth={2.5}
//               fill="url(#raisedAreaGrad)"
//               dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
//               activeDot={{ r: 6 }} />
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
  ResponsiveContainer,
  Legend
} from 'recharts'
import { FiTrendingUp } from 'react-icons/fi'
import { CustomTooltip } from './CustomTooltip'
import type { ProjectChartData } from './types'

interface Props {
  data: ProjectChartData[]
}

export default function ProjectFundingProgress({ data }: Props) {

  const totalRaised = data.reduce((acc, curr) => acc + curr.raised, 0)
  const totalTarget = data.reduce((acc, curr) => acc + curr.target, 0)
  const percent = totalTarget ? ((totalRaised / totalTarget) * 100).toFixed(1) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            Project Funding Progress
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Raised vs Target amount per project
          </p>
        </div>
        <div className="bg-indigo-50 p-2 rounded-lg">
          <FiTrendingUp className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      {/* TOP STATS */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Stat label="Raised" value={`₹${(totalRaised / 1000).toFixed(0)}k`} />
          <Stat label="Target" value={`₹${(totalTarget / 1000).toFixed(0)}k`} />
          <Stat label="Progress" value={`${percent}%`} highlight />
        </div>
      )}

      {/* CHART */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-gray-400 text-sm">
          <FiTrendingUp className="mb-2 opacity-40" />
          No project data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="raisedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* TARGET */}
            <Area
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#targetAreaGrad)"
              dot={false}
              isAnimationActive
            />

            {/* RAISED */}
            <Area
              type="monotone"
              dataKey="raised"
              name="Raised"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#raisedAreaGrad)"
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

/* 🔹 Small reusable stat component */
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