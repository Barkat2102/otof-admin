export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.name !== 'progress'
            ? `₹${p.value.toLocaleString()}` : p.value}
          {p.name === 'progress' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}
