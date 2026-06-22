'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FiPlus, FiX, FiFlag, FiTrash2, FiEdit2, FiAlertTriangle, FiCheck, FiChevronLeft, FiSearch, FiChevronRight } from 'react-icons/fi'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

interface Project  { _id: string; title: string; category: string; status: string }
interface Milestone {
  _id: string; projectId: string; title: string; description: string
  targetValue: number; currentValue: number; unit: string; dueDate: string; status: string
}

const INIT        = { projectId: '', title: '', description: '', targetValue: '', currentValue: '0', unit: '', dueDate: '' }
const CATEGORIES  = ['All', 'Education', 'Health', 'Environment', 'Food', 'Social', 'Other']
const PAGE_SIZE   = 6

const statusStyle: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-50 text-amber-700',
  completed:   'bg-emerald-50 text-emerald-700',
}
const projectStatusColor: Record<string, string> = {
  upcoming:  'bg-amber-50 text-amber-700',
  active:    'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
}
const categoryEmoji: Record<string, string> = {
  Education: '📚', Health: '🏥', Environment: '🌿',
  Food: '🍱', Social: '🤝', Other: '🌟',
}

export default function MilestonesPage() {
  const [projects,    setProjects]    = useState<Project[]>([])
  const [milestones,  setMilestones]  = useState<Milestone[]>([])
  const [selProject,  setSelProject]  = useState<Project | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [projLoading, setProjLoading] = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [editMs,      setEditMs]      = useState<Milestone | null>(null)
  const [form,        setForm]        = useState(INIT)
  const [formError,   setFormError]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [deleteMs,    setDeleteMs]    = useState<Milestone | null>(null)

  // filter + search + pagination (projects view)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [page,     setPage]     = useState(1)

  const { show } = useToastStore()
  const api = authService.getApi()

  const fetchProjects = useCallback(async () => {
    setProjLoading(true)
    try { const { data } = await api.get('/admin/projects'); setProjects(data.projects) }
    catch {} finally { setProjLoading(false) }
  }, [api])

  const fetchMilestones = useCallback(async (pid: string) => {
    setLoading(true)
    try { const { data } = await api.get(`/admin/milestones/project/${pid}`); setMilestones(data.milestones) }
    catch {} finally { setLoading(false) }
  }, [api])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // reset page when filter/search changes
  useEffect(() => { setPage(1) }, [search, category])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCat    = category === 'All' || p.category === category
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [projects, search, category])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectProject = (p: Project) => { setSelProject(p); fetchMilestones(p._id) }
  const goBack        = () => { setSelProject(null); setMilestones([]); setSearch(''); setCategory('All'); setPage(1) }

  const openCreate = () => {
    setForm({ ...INIT, projectId: selProject!._id })
    setEditMs(null); setFormError(''); setShowForm(true)
  }
  const openEdit = (m: Milestone) => {
    setForm({ projectId: m.projectId, title: m.title, description: m.description,
      targetValue: String(m.targetValue), currentValue: String(m.currentValue),
      unit: m.unit, dueDate: m.dueDate.slice(0, 10) })
    setEditMs(m); setFormError(''); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setSubmitting(true)
    try {
      const payload = { ...form, targetValue: Number(form.targetValue), currentValue: Number(form.currentValue) }
      if (editMs) {
        const { data } = await api.put(`/admin/milestones/${editMs._id}`, payload)
        setMilestones(prev => prev.map(m => m._id === editMs._id ? data.milestone : m))
        show('userUpdated', form.title)
      } else {
        const { data } = await api.post('/admin/milestones', payload)
        setMilestones(prev => [...prev, data.milestone])
        show('userCreated', form.title)
      }
      setShowForm(false)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save milestone')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteMs) return
    try {
      await api.delete(`/admin/milestones/${deleteMs._id}`)
      setMilestones(prev => prev.filter(m => m._id !== deleteMs._id))
      show('userDeleted', deleteMs.title)
      setDeleteMs(null)
    } catch {}
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {selProject && (
            <button onClick={goBack} className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selProject ? selProject.title : 'Milestones'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {selProject ? 'Manage milestones for this project' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>
        {selProject && (
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <FiPlus className="w-4 h-4" /> Add Milestone
          </button>
        )}
      </div>

      {/* ── PROJECT CARDS VIEW ── */}
      {!selProject && (
        projLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      category === c
                        ? 'text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                    style={category === c ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                    {c === 'All' ? 'All' : `${categoryEmoji[c]} ${c}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <FiFlag className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">No projects found</p>
                <p className="text-sm mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginated.map(p => (
                  <button key={p._id} onClick={() => selectProject(p)}
                    className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-50">
                        {categoryEmoji[p.category] || '🌟'}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${projectStatusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-indigo-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiFlag className="w-3 h-3" /> View Milestones →
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 disabled:opacity-40 transition-all">
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        page === n ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-300'
                      }`}
                      style={page === n ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 disabled:opacity-40 transition-all">
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* ── MILESTONES LIST VIEW ── */}
      {selProject && (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiFlag className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No milestones yet</p>
            <p className="text-sm mt-1">Add the first milestone for this project</p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map(m => {
              const pct = m.targetValue > 0 ? Math.min(100, Math.round((m.currentValue / m.targetValue) * 100)) : 0
              return (
                <div key={m._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{m.title}</h3>
                      {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${statusStyle[m.status] || statusStyle.pending}`}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-bold text-gray-700">{m.currentValue} / {m.targetValue} {m.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                    </div>
                    <p className="text-right text-xs text-indigo-600 font-semibold mt-1">{pct}%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Due: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all">
                        <FiEdit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setDeleteMs(m)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all">
                        <FiTrash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editMs ? 'Edit Milestone' : 'Add Milestone'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠️ {formError}</div>}

              {[
                { key: 'title',       label: 'Milestone Title', ph: '100 meals distributed', required: true  },
                { key: 'description', label: 'Description',     ph: 'Optional description',  required: false },
              ].map(({ key, label, ph, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input type="text" value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph} required={required}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Target</label>
                  <input type="number" value={form.targetValue} onChange={e => setForm(p => ({ ...p, targetValue: e.target.value }))} required min={1}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current</label>
                  <input type="number" value={form.currentValue} onChange={e => setForm(p => ({ ...p, currentValue: e.target.value }))} min={0}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                  <input type="text" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="meals"
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck className="w-4 h-4" />}
                  {editMs ? 'Update' : 'Add Milestone'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteMs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FiAlertTriangle className="w-6 h-6 text-red-600" /></div>
            <h2 className="font-bold text-gray-900">Delete Milestone</h2>
            <p className="text-gray-500 text-sm mt-2">Delete <span className="font-semibold text-gray-800">{deleteMs.title}</span>?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all">Delete</button>
              <button onClick={() => setDeleteMs(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
