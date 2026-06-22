'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiTrendingUp, FiRefreshCw, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

interface Project {
  _id: string; title: string; category: string
  targetAmount: number; raisedAmount: number
  status: string; progress: number
}

const statusColor: Record<string, string> = {
  upcoming:  'bg-amber-50 text-amber-700',
  active:    'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
}

export default function ProgressPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [loading, setLoading]     = useState(true)
  const [editId, setEditId]       = useState<string | null>(null)
  const [raisedVal, setRaisedVal] = useState('')
  const [saving, setSaving]       = useState(false)
  const { show } = useToastStore()
  const api = authService.getApi()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/projects'); setProjects(data.projects) }
    catch {} finally { setLoading(false) }
  }, [api])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const openEdit = (p: Project) => { setEditId(p._id); setRaisedVal(String(p.raisedAmount)) }

  const handleSave = async (p: Project) => {
    setSaving(true)
    try {
      const { data } = await api.put(`/admin/projects/${p._id}`, { raisedAmount: Number(raisedVal) })
      setProjects(prev => prev.map(pr => pr._id === p._id
        ? { ...pr, raisedAmount: data.project.raisedAmount, progress: Math.min(100, Math.round((data.project.raisedAmount / pr.targetAmount) * 100)) }
        : pr
      ))
      show('userUpdated', p.title)
      setEditId(null)
    } catch {} finally { setSaving(false) }
  }

  const totalTarget = projects.reduce((s, p) => s + p.targetAmount, 0)
  const totalRaised = projects.reduce((s, p) => s + p.raisedAmount, 0)
  const overallPct  = totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track and update project progress</p>
        </div>
        <button onClick={fetchProjects} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overall */}
      <div className="rounded-2xl p-6 text-white overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <p className="text-sm text-white/70 font-medium mb-1">Overall Progress</p>
        <p className="text-4xl font-bold mb-1">{overallPct}%</p>
        <p className="text-white/60 text-sm">₹{totalRaised.toLocaleString()} raised of ₹{totalTarget.toLocaleString()}</p>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Projects */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{p.category}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-indigo-600">{p.progress}%</span>
              </div>

              <div className="mb-4">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                </div>
              </div>

              {/* Raised Amount Edit */}
              {editId === p._id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">₹</span>
                  <input type="number" value={raisedVal} onChange={e => setRaisedVal(e.target.value)}
                    min={0} max={p.targetAmount}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  <span className="text-xs text-gray-400">/ ₹{p.targetAmount.toLocaleString()}</span>
                  <button onClick={() => handleSave(p)} disabled={saving}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <FiCheck className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">₹{p.raisedAmount.toLocaleString()}</span>
                    <span className="text-gray-400"> / ₹{p.targetAmount.toLocaleString()}</span>
                  </p>
                  <button onClick={() => openEdit(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all">
                    <FiEdit2 className="w-3.5 h-3.5" /> Update Amount
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
