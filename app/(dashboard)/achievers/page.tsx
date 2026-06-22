'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiX, FiAward, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

interface User    { _id: string; name: string; email: string }
interface Project { _id: string; title: string }
interface Achiever {
  _id: string
  userId:    { _id: string; name: string; email: string }
  projectId: { _id: string; title: string } | null
  title: string; badge: string; reason: string; awardedAt: string
}

const BADGES = ['gold', 'silver', 'bronze', 'special']
const INIT   = { userId: '', projectId: '', title: '', badge: 'gold', reason: '' }

const badgeStyle: Record<string, { bg: string; text: string; emoji: string }> = {
  gold:    { bg: 'bg-amber-50',   text: 'text-amber-700',   emoji: '🏆' },
  silver:  { bg: 'bg-gray-100',   text: 'text-gray-700',    emoji: '🥈' },
  bronze:  { bg: 'bg-orange-50',  text: 'text-orange-700',  emoji: '🥉' },
  special: { bg: 'bg-purple-50',  text: 'text-purple-700',  emoji: '⭐' },
}

export default function AchieversPage() {
  const [achievers, setAchievers] = useState<Achiever[]>([])
  const [users, setUsers]         = useState<User[]>([])
  const [projects, setProjects]   = useState<Project[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(INIT)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteA, setDeleteA]     = useState<Achiever | null>(null)
  const { show } = useToastStore()
  const api = authService.getApi()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [a, u, p] = await Promise.all([
        api.get('/admin/achievers'),
        api.get('/users?limit=100'),
        api.get('/admin/projects'),
      ])
      setAchievers(a.data.achievers)
      setUsers(u.data.users)
      setProjects(p.data.projects)
    } catch {} finally { setLoading(false) }
  }, [api])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setSubmitting(true)
    try {
      const payload = { ...form, projectId: form.projectId || undefined }
      const { data } = await api.post('/admin/achievers', payload)
      setAchievers(prev => [data.achiever, ...prev])
      show('userCreated', form.title)
      setShowForm(false); setForm(INIT)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to assign badge')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteA) return
    try {
      await api.delete(`/admin/achievers/${deleteA._id}`)
      setAchievers(prev => prev.filter(a => a._id !== deleteA._id))
      show('userDeleted', deleteA.title)
      setDeleteA(null)
    } catch {}
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Achievers</h1>
          <p className="text-gray-500 text-sm mt-1">Assign badges and recognize top contributors</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormError(''); setForm(INIT) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <FiPlus className="w-4 h-4" /> Assign Badge
        </button>
      </div>

      {/* Badge Stats */}
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map(b => {
          const s = badgeStyle[b]
          return (
            <div key={b} className={`rounded-2xl p-4 border border-gray-100 shadow-sm text-center ${s.bg}`}>
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className={`text-lg font-bold ${s.text}`}>{achievers.filter(a => a.badge === b).length}</p>
              <p className="text-xs text-gray-500 capitalize">{b}</p>
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Assign Badge</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠️ {formError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select User</label>
                <select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="">-- Select user --</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Linked Project (Optional)</label>
                <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="">-- None --</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Achievement Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Gold Achiever / Impact Hero" required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Badge</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGES.map(b => {
                    const s = badgeStyle[b]
                    return (
                      <button key={b} type="button" onClick={() => setForm(p => ({ ...p, badge: b }))}
                        className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${form.badge === b ? `${s.bg} ${s.text} border-current` : 'bg-gray-50 text-gray-500 border-transparent'}`}>
                        {s.emoji} {b}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reason</label>
                <input type="text" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Donated ₹10,000 / 100 meals distributed" required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiAward className="w-4 h-4" />} Assign Badge
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FiAlertTriangle className="w-6 h-6 text-red-600" /></div>
            <h2 className="font-bold text-gray-900">Remove Badge</h2>
            <p className="text-gray-500 text-sm mt-2">Remove <span className="font-semibold">{deleteA.title}</span> from <span className="font-semibold">{deleteA.userId?.name}</span>?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all">Remove</button>
              <button onClick={() => setDeleteA(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Achievers List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : achievers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FiAward className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No badges assigned yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">All Achievers</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {achievers.map(a => {
              const s = badgeStyle[a.badge]
              return (
                <div key={a._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${s.bg}`}>{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{a.userId?.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{a.badge}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{a.title} · {a.reason}</p>
                    {a.projectId && <p className="text-[10px] text-indigo-500 mt-0.5">📁 {a.projectId.title}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(a.awardedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <button onClick={() => setDeleteA(a)} className="mt-1 text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
