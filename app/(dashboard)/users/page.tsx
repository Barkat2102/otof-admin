'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FiPlus, FiX, FiUser, FiMail, FiPhone, FiLock,
  FiUsers, FiRefreshCw, FiTrash2, FiAlertTriangle, FiEdit2, FiCheck,
} from 'react-icons/fi'
import { authService } from '@/lib/authService'
import { useToastStore } from '@/lib/toastStore'

interface User {
  _id: string; name: string; email: string
  mobile: string; isActive: boolean; createdAt: string
}
interface Pagination { total: number; page: number; totalPages: number }

const INIT_FORM = { name: '', email: '', mobile: '', password: '' }

export default function UsersPage() {
  const [users, setUsers]           = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState(INIT_FORM)
  const [formError, setFormError]   = useState('')
  const [creating, setCreating]     = useState(false)
  const [editUser, setEditUser]     = useState<User | null>(null)
  const [editForm, setEditForm]     = useState({ name: '', mobile: '' })
  const [editError, setEditError]   = useState('')
  const [updating, setUpdating]     = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const { show } = useToastStore()
  const api = authService.getApi()

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/users?page=${page}&limit=10`)
      setUsers(data.users)
      setPagination(data.pagination)
    } catch {} finally { setLoading(false) }
  }, [api])

  useEffect(() => { fetchUsers(1) }, [fetchUsers])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setCreating(true)
    try {
      const { data } = await api.post('/users', form)
      setUsers(prev => [data.user, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      setForm(INIT_FORM)
      setShowCreate(false)
      show('userCreated', data.user.name)
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create user')
    } finally { setCreating(false) }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setEditError('')
    setUpdating(true)
    try {
      const { data } = await api.put(`/users/${editUser._id}`, editForm)
      setUsers(prev => prev.map(u => u._id === editUser._id ? { ...u, ...data.user } : u))
      setEditUser(null)
      show('userUpdated', data.user.name)
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update user')
    } finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    const name = deleteUser.name
    try {
      await api.delete(`/users/${deleteUser._id}`)
      setUsers(prev => prev.filter(u => u._id !== deleteUser._id))
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      setDeleteUser(null)
      show('userDeleted', name)
    } catch {} finally { setDeleting(false) }
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditForm({ name: user.name, mobile: user.mobile })
    setEditError('')
  }

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create, edit and manage platform users</p>
        </div>
        <button onClick={() => { setShowCreate(true); setFormError(''); setForm(INIT_FORM) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <FiPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Create New User</h2>
                <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ⚠️ {formError}
                </div>
              )}
              {[
                { key: 'name',     label: 'Full Name',     icon: FiUser,  type: 'text',     ph: 'John Doe'         },
                { key: 'email',    label: 'Email Address', icon: FiMail,  type: 'email',    ph: 'john@example.com' },
                { key: 'mobile',   label: 'Mobile Number', icon: FiPhone, type: 'tel',      ph: '9876543210'       },
                { key: 'password', label: 'Password',      icon: FiLock,  type: 'password', ph: 'Min 6 characters' },
              ].map(({ key, label, icon: Icon, type, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4" />
                    <input type={type} value={form[key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph} required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {creating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><FiPlus className="w-4 h-4" /> Create User</>}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Edit User</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editUser.email}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {editError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  ⚠️ {editError}
                </div>
              )}
              {[
                { key: 'name',   label: 'Full Name',     icon: FiUser,  type: 'text', ph: 'John Doe'   },
                { key: 'mobile', label: 'Mobile Number', icon: FiPhone, type: 'tel',  ph: '9876543210' },
              ].map(({ key, label, icon: Icon, type, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4" />
                    <input type={type} value={editForm[key as keyof typeof editForm]}
                      onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph} required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {updating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FiCheck className="w-4 h-4" /> Save Changes</>}
                </button>
                <button type="button" onClick={() => setEditUser(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Delete User</h2>
              <p className="text-gray-500 text-sm mt-2">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteUser.name}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-60 active:scale-95">
                {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</> : <><FiTrash2 className="w-4 h-4" /> Delete</>}
              </button>
              <button onClick={() => setDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-emerald-600">{users.length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">All Users</h2>
          <button onClick={() => fetchUsers(pagination.page)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiUsers className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No users yet</p>
            <p className="text-sm mt-1">Create your first user to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-gray-50/80">
                    {['User', 'Mobile', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.mobile}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all active:scale-95">
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => setDeleteUser(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all active:scale-95">
                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50">
                <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages} · {pagination.total} total</p>
                <div className="flex gap-1">
                  <button disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                  <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
