'use client'

import { COLORS } from './types'

interface Props {
  data: { name: string; count: number }[]
  total: number
}

const EMOJIS = ['🏆', '🥈', '🥉', '⭐']

export default function BadgeDistribution({ data, total }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-900 mb-4 text-sm">Badge Distribution</h2>
      <div className="space-y-2.5">
        {data.map((b, i) => (
          <div key={b.name} className="flex items-center gap-3">
            <span className="text-base w-5 flex-shrink-0">{EMOJIS[i]}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{b.name}</span>
                <span className="font-bold text-gray-800">{b.count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${total > 0 ? (b.count / total) * 100 : 0}%`,
                    background: COLORS[i],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
