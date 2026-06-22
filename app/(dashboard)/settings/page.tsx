'use client'

import { useState, useEffect, useRef } from 'react'
import { authService } from '@/lib/authService'
import {
  FiSave, FiDatabase, FiCheck, FiGlobe,
  FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook,
  FiTwitter, FiLinkedin, FiYoutube, FiUpload, FiUser, FiKey,
  FiEye, FiEyeOff, FiLock, FiCreditCard, FiImage,
} from 'react-icons/fi'

interface OrgSettings {
  organizationName: string
  logo: string
  contactEmail: string
  contactPhone: string
  address: string
  websiteUrl: string
  facebook: string
  instagram: string
  twitter: string
  linkedin: string
  youtube: string
  mission: string
  upiId: string
  qrCode: string
  bankAccountName: string
  bankAccountNumber: string
  bankIfsc: string
  bankName: string
  bankBranch: string
}

interface User { _id: string; name: string; email: string; mobile: string; isActive: boolean }

const TABS = ['Organization', 'Payment', 'User Password'] as const
type Tab = typeof TABS[number]

const inputCls = 'w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

export default function SettingsPage() {
  const api = authService.getApi()
  const [tab, setTab] = useState<Tab>('Organization')

  const [org, setOrg] = useState<OrgSettings>({
    organizationName: '', logo: '', contactEmail: '', contactPhone: '',
    address: '', websiteUrl: '', facebook: '', instagram: '',
    twitter: '', linkedin: '', youtube: '', mission: '',
    upiId: '', qrCode: '', bankAccountName: '', bankAccountNumber: '',
    bankIfsc: '', bankName: '', bankBranch: '',
  })
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgSaved, setOrgSaved] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const qrRef = useRef<HTMLInputElement>(null)

  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    api.get('/settings/org')
      .then(r => { setOrg(r.data); setOrgLoading(false) })
      .catch(() => setOrgLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'User Password' && users.length === 0) {
      setUsersLoading(true)
      api.get('/settings/users')
        .then(r => { setUsers(r.data); setUsersLoading(false) })
        .catch(() => setUsersLoading(false))
    }
  }, [tab])

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'logo' | 'qrCode'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const max = 400
        const ratio = Math.min(max / img.width, max / img.height, 1)
        canvas.width  = img.width  * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        setOrg(p => ({ ...p, [key]: canvas.toDataURL('image/jpeg', 0.7) }))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const saveOrg = async () => {
    setOrgSaving(true)
    try {
      await api.put('/settings/org', org)
      setOrgSaved(true)
      setTimeout(() => setOrgSaved(false), 3000)
    } catch (e: any) {
      console.error('Save failed:', e?.response?.data || e?.message)
    } finally {
      setOrgSaving(false)
    }
  }

  const changePassword = async () => {
    if (!selectedUser || !newPwd) return
    setPwdSaving(true)
    setPwdMsg(null)
    try {
      await api.put(`/settings/users/${selectedUser}/password`, { newPassword: newPwd })
      setPwdMsg({ type: 'success', text: 'Password updated successfully' })
      setNewPwd('')
    } catch (e: any) {
      setPwdMsg({ type: 'error', text: e?.response?.data?.message || 'Failed to update password' })
    } finally {
      setPwdSaving(false)
    }
  }

  const SaveBar = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3">
      <button
        onClick={saveOrg}
        disabled={orgSaving}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        {orgSaving
          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <FiSave className="w-4 h-4" />}
        {label}
      </button>
      {orgSaved && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          <FiCheck className="w-4 h-4" /> Saved successfully
        </div>
      )}
    </div>
  )

  if (orgLoading && tab !== 'User Password') {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system configuration and preferences</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage system configuration and preferences</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Organization' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-50 p-2.5 rounded-xl"><FiDatabase className="w-4 h-4 text-indigo-600" /></div>
              <h2 className="font-bold text-gray-900">Identity</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition-all"
                  onClick={() => logoRef.current?.click()}
                >
                  {org.logo
                    ? <img src={org.logo} alt="logo" className="w-full h-full object-cover" />
                    : <FiUpload className="w-6 h-6 text-gray-300" />}
                </div>
                <button onClick={() => logoRef.current?.click()} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Upload Logo
                </button>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo')} />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className={labelCls}>Organization Name</label>
                  <input className={inputCls} value={org.organizationName}
                    onChange={e => setOrg(p => ({ ...p, organizationName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Mission Statement / About</label>
                  <textarea rows={3} className={inputCls + ' resize-none'} value={org.mission}
                    onChange={e => setOrg(p => ({ ...p, mission: e.target.value }))}
                    placeholder="Describe your organization's mission..." />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-emerald-50 p-2.5 rounded-xl"><FiPhone className="w-4 h-4 text-emerald-600" /></div>
              <h2 className="font-bold text-gray-900">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Contact Email', key: 'contactEmail', icon: FiMail, type: 'email', placeholder: 'contact@example.org' },
                { label: 'Contact Phone', key: 'contactPhone', icon: FiPhone, type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'Website URL', key: 'websiteUrl', icon: FiGlobe, type: 'url', placeholder: 'https://yourorg.org' },
                { label: 'Address', key: 'address', icon: FiMapPin, type: 'text', placeholder: 'City, State, Country' },
              ].map(({ label, key, icon: Icon, type, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={type}
                      placeholder={placeholder}
                      className={inputCls + ' pl-9'}
                      value={org[key as keyof OrgSettings]}
                      onChange={e => setOrg(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-pink-50 p-2.5 rounded-xl"><FiInstagram className="w-4 h-4 text-pink-600" /></div>
              <h2 className="font-bold text-gray-900">Social Media</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Facebook', key: 'facebook', icon: FiFacebook, color: 'text-blue-600', placeholder: 'https://facebook.com/yourpage' },
                { label: 'Instagram', key: 'instagram', icon: FiInstagram, color: 'text-pink-600', placeholder: 'https://instagram.com/yourhandle' },
                { label: 'Twitter/X', key: 'twitter', icon: FiTwitter, color: 'text-sky-500', placeholder: 'https://twitter.com/yourhandle' },
                { label: 'LinkedIn', key: 'linkedin', icon: FiLinkedin, color: 'text-blue-700', placeholder: 'https://linkedin.com/company/yourorg' },
                { label: 'YouTube', key: 'youtube', icon: FiYoutube, color: 'text-red-600', placeholder: 'https://youtube.com/@yourchannel' },
              ].map(({ label, key, icon: Icon, color, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${color}`} />
                    <input
                      type="url"
                      placeholder={placeholder}
                      className={inputCls + ' pl-9'}
                      value={org[key as keyof OrgSettings]}
                      onChange={e => setOrg(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SaveBar label="Save Changes" />
        </div>
      )}

      {tab === 'Payment' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-50 p-2.5 rounded-xl"><FiImage className="w-4 h-4 text-indigo-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">UPI / QR Code</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage public payment QR and UPI details for the landing page</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition-all"
                  onClick={() => qrRef.current?.click()}
                >
                  {org.qrCode
                    ? <img src={org.qrCode} alt="Payment QR code" className="w-full h-full object-cover" />
                    : <div className="text-center px-4"><FiUpload className="w-6 h-6 text-gray-300 mx-auto mb-2" /><p className="text-[11px] text-gray-400 font-medium">Upload QR code</p></div>}
                </div>
                <button onClick={() => qrRef.current?.click()} className="text-xs font-semibold text-indigo-600 hover:underline">
                  Upload QR Code
                </button>
                {org.qrCode && (
                  <button onClick={() => setOrg(p => ({ ...p, qrCode: '' }))} className="text-[11px] font-medium text-rose-600 hover:underline">
                    Remove QR Code
                  </button>
                )}
                <input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'qrCode')} />
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>UPI ID</label>
                  <div className="relative">
                    <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className={inputCls + ' pl-9'}
                      value={org.upiId}
                      placeholder="foundation@upi"
                      onChange={e => setOrg(p => ({ ...p, upiId: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>QR Code URL (optional)</label>
                  <input
                    className={inputCls}
                    value={org.qrCode.startsWith('data:') ? '' : org.qrCode}
                    placeholder="https://example.com/payment-qr.png"
                    onChange={e => setOrg(p => ({ ...p, qrCode: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Upload an image above or paste a hosted image URL here.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-emerald-50 p-2.5 rounded-xl"><FiDatabase className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Bank Transfer / NEFT</h2>
                <p className="text-xs text-gray-400 mt-0.5">These values will be shown publicly in donation payment details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Account Name', key: 'bankAccountName', placeholder: 'One Team One Foundation' },
                { label: 'Account Number', key: 'bankAccountNumber', placeholder: '1234567890' },
                { label: 'IFSC Code', key: 'bankIfsc', placeholder: 'SBIN0000001' },
                { label: 'Bank Name', key: 'bankName', placeholder: 'State Bank of India' },
                { label: 'Branch', key: 'bankBranch', placeholder: 'Main Branch' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    value={org[key as keyof OrgSettings]}
                    placeholder={placeholder}
                    onChange={e => setOrg(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <SaveBar label="Save Payment Settings" />
        </div>
      )}

      {tab === 'User Password' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-violet-50 p-2.5 rounded-xl"><FiKey className="w-4 h-4 text-violet-600" /></div>
              <div>
                <h2 className="font-bold text-gray-900">Change User Password</h2>
                <p className="text-xs text-gray-400 mt-0.5">Select a user and set a new password</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Select User</label>
              {usersLoading ? (
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className={inputCls + ' pl-9'} value={selectedUser}
                    onChange={e => { setSelectedUser(e.target.value); setPwdMsg(null) }}>
                    <option value="">-- Choose a user --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedUser && (() => {
              const user = users.find(x => x._id === selectedUser)
              if (!user) return null
              return (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email} · {user.mobile}</p>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )
            })()}

            <div>
              <label className={labelCls}>New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className={inputCls + ' pl-9 pr-10'}
                  value={newPwd}
                  onChange={e => { setNewPwd(e.target.value); setPwdMsg(null) }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {newPwd && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      newPwd.length >= i * 3
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {pwdMsg && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                pwdMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <FiCheck className="w-4 h-4 flex-shrink-0" />
                {pwdMsg.text}
              </div>
            )}

            <button
              onClick={changePassword}
              disabled={!selectedUser || newPwd.length < 6 || pwdSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {pwdSaving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FiKey className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
