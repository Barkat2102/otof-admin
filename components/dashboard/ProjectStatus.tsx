'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { name: string; value: number }[]
}

const STATUS_COLORS = ['#10b981', '#f59e0b', '#6366f1']

export default function ProjectStatus({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-900 mb-4 text-sm">Project Status</h2>

      {data.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No data</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={45}
                paddingAngle={3} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, 'Projects']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-3">
            {data.map((d, i) => (
              <div key={d.name} className="text-center">
                <p className="text-lg font-bold" style={{ color: STATUS_COLORS[i % STATUS_COLORS.length] }}>
                  {d.value}
                </p>
                <p className="text-[10px] text-gray-400">{d.name}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
