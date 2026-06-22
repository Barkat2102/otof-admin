'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiX, FiFolder, FiTrash2, FiEdit2, FiUsers, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

interface User { _id: string; name: string; email: string }
interface Project {
  _id: string; title: string; description: string; category: string
  targetAmount: number; raisedAmount: number; status: string
  startDate: string; endDate: string; assignedUsers: User[]; progress: number
}

const CATEGORIES = ['Education', 'Health', 'Environment', 'Social', 'Food', 'Other']
const STATUSES   = ['upcoming', 'active', 'completed']
const INIT = { title: '', description: '', category: 'Education', targetAmount: '', startDate: '', endDate: '', status: 'upcoming', assignedUsers: [] as string[] }

const statusColor: Record<string, string> = {
  upcoming:  'bg-amber-50 text-amber-700',
  active:    'bg-emerald-50 text-emerald-700',
  completed: 'bg-blue-50 text-blue-700',
}

export default function ProjectsPage() {
  const [projects, setProjects]     = useState<Project[]>([])
  const [users, setUsers]           = useState<User[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [form, setForm]             = useState(INIT)
  const [formError, setFormError]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const { show } = useToastStore()
  const api = authService.getApi()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/projects')
      setProjects(data.projects)
    } catch {} finally { setLoading(false) }
  }, [api])

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users?limit=100')
      setUsers(data.users)
    } catch {}
  }, [api])

  useEffect(() => { fetchProjects(); fetchUsers() }, [fetchProjects, fetchUsers])

  const openCreate = () => { setForm(INIT); setEditProject(null); setFormError(''); setShowForm(true) }
  const openEdit   = (p: Project) => {
    setForm({
      title: p.title, description: p.description, category: p.category,
      targetAmount: String(p.targetAmount), startDate: p.startDate.slice(0, 10),
      endDate: p.endDate.slice(0, 10), status: p.status,
      assignedUsers: p.assignedUsers.map(u => typeof u === 'string' ? u : u._id),
    })
    setEditProject(p); setFormError(''); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setSubmitting(true)
    try {
      const payload = { ...form, targetAmount: Number(form.targetAmount) }
      if (editProject) {
        const { data } = await api.put(`/admin/projects/${editProject._id}`, payload)
        setProjects(prev => prev.map(p => p._id === editProject._id ? { ...p, ...data.project } : p))
        show('userUpdated', form.title)
      } else {
        const { data } = await api.post('/admin/projects', payload)
        setProjects(prev => [data.project, ...prev])
        show('userCreated', form.title)
      }
      setShowForm(false)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save project')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteProject) return
    setDeleting(true)
    try {
      await api.delete(`/admin/projects/${deleteProject._id}`)
      setProjects(prev => prev.filter(p => p._id !== deleteProject._id))
      show('userDeleted', deleteProject.title)
      setDeleteProject(null)
    } catch {} finally { setDeleting(false) }
  }

  const toggleUser = (uid: string) =>
    setForm(p => ({
      ...p,
      assignedUsers: p.assignedUsers.includes(uid)
        ? p.assignedUsers.filter(id => id !== uid)
        : [...p.assignedUsers, uid],
    }))

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage NGO projects</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProjects} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <FiPlus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',     value: projects.length,                                  color: 'text-gray-900'    },
          { label: 'Active',    value: projects.filter(p => p.status === 'active').length,    color: 'text-emerald-600' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'text-blue-600'    },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-900">{editProject ? 'Edit Project' : 'Create Project'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {formError && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">⚠️ {formError}</div>}

              {[
                { key: 'title',       label: 'Project Title',  type: 'text',   ph: 'Food Distribution 2026' },
                { key: 'description', label: 'Description',    type: 'text',   ph: 'Brief description...'   },
              ].map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input type={type} value={form[key as keyof typeof form] as string}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph} required
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Target Amount (₹)</label>
                <input type="number" value={form.targetAmount}
                  onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
                  placeholder="100000" required min={1}
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{ key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type="date" value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                ))}
              </div>

              {/* Assign Users */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Assign Users ({form.assignedUsers.length} selected)
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2 bg-gray-50">
                  {users.length === 0
                    ? <p className="text-xs text-gray-400 text-center py-2">No users found</p>
                    : users.map(u => (
                      <label key={u._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
                        <input type="checkbox" checked={form.assignedUsers.includes(u._id)}
                          onChange={() => toggleUser(u._id)}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{u.name}</p>
                          <p className="text-[10px] text-gray-400">{u.email}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FiPlus className="w-4 h-4" /> {editProject ? 'Update' : 'Create'}</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Delete Project</h2>
            <p className="text-gray-500 text-sm mt-2">Delete <span className="font-semibold text-gray-800">{deleteProject.title}</span>? All milestones will also be deleted.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60">
                {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiTrash2 className="w-4 h-4" />} Delete
              </button>
              <button onClick={() => setDeleteProject(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FiFolder className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Create your first project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {projects.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2 ${statusColor[p.status]}`}>{p.status}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">{p.category}</span>
                  <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> {p.assignedUsers?.length || 0} users</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold text-gray-700">₹{p.raisedAmount?.toLocaleString()} / ₹{p.targetAmount?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                  </div>
                  <p className="text-right text-xs text-indigo-600 font-semibold mt-1">{p.progress}%</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all">
                    <FiEdit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteProject(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all">
                    <FiTrash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
