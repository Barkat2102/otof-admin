'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS } from './types'

interface Props {
  data: { name: string; value: number }[]
}

export default function ProjectsByCategory({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5">
        <h2 className="font-bold text-gray-900">Projects by Category</h2>
        <p className="text-xs text-gray-400 mt-0.5">Distribution across categories</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Projects']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-bold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
