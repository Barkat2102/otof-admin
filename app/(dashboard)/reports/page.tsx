'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/authService'
import {
  FiDownload, FiRefreshCw, FiFolder, FiUsers,
  FiFlag, FiTrendingUp, FiBarChart2, FiCalendar,
} from 'react-icons/fi'

interface User      { _id: string; name: string; email: string }
interface Milestone { _id: string; title: string; status: string; currentValue: number; targetValue: number; unit: string; dueDate: string }
interface Project   {
  _id: string; title: string; description: string; category: string
  targetAmount: number; raisedAmount: number; status: string
  startDate: string; endDate: string; assignedUsers: User[]; progress: number
}

const statusColor: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  upcoming:  { bg: 'bg-amber-50',   text: 'text-amber-700'   },
  completed: { bg: 'bg-blue-50',    text: 'text-blue-700'    },
}

function fmt(n: number) { return `Rs.${n.toLocaleString('en-IN')}` }

// ── PDF Generation (pure jsPDF, no html2canvas) ──────────────────────────────
async function generatePDF(project: Project, milestones: Milestone[]) {
  const { default: jsPDF } = await import('jspdf')

  const doc   = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const W     = doc.internal.pageSize.getWidth()   // 595
  const H     = doc.internal.pageSize.getHeight()  // 842
  const L     = 40   // left margin
  const R     = W - 40 // right margin
  const INNER = R - L

  let y = 0

  // ── helpers ────────────────────────────────────────────────────────────────
  function newPage() {
    doc.addPage()
    y = 0
    drawPageFooter()
  }

  function checkY(needed: number) {
    if (y + needed > H - 60) newPage()
  }

  function hex(color: string) { doc.setFillColor(color) }

  function rect(x: number, ry: number, w: number, h: number, color: string, radius = 0) {
    doc.setFillColor(color)
    if (radius > 0) doc.roundedRect(x, ry, w, h, radius, radius, 'F')
    else doc.rect(x, ry, w, h, 'F')
  }

  function text(
    str: string, x: number, ty: number,
    { size = 10, color = '#111111', bold = false, align = 'left' as 'left' | 'center' | 'right', maxWidth }: {
      size?: number; color?: string; bold?: boolean; align?: 'left' | 'center' | 'right'; maxWidth?: number
    } = {}
  ) {
    doc.setFontSize(size)
    doc.setTextColor(color)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    if (maxWidth) {
      const lines = doc.splitTextToSize(str, maxWidth)
      doc.text(lines, x, ty, { align })
      return lines.length
    }
    doc.text(str, x, ty, { align })
    return 1
  }

  function drawPageFooter() {
    const pg = (doc as any).internal.getCurrentPageInfo().pageNumber
    doc.setDrawColor('#e5e7eb')
    doc.setLineWidth(0.5)
    doc.line(L, H - 40, R, H - 40)
    text('One Team One Foundation · Confidential Report', L, H - 24, { size: 8, color: '#9ca3af' })
    text(`Page ${pg}`, R, H - 24, { size: 8, color: '#9ca3af', align: 'right' })
  }

  // ── COVER / HEADER BAND ────────────────────────────────────────────────────
  // Deep indigo gradient band
  rect(0, 0, W, 180, '#4f46e5')
  rect(0, 0, W, 180, '#6366f1') // layered for depth

  // Decorative circles
  doc.setFillColor('#ffffff')
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }))
  doc.circle(W - 60, 30, 90, 'F')
  doc.circle(W - 20, 160, 60, 'F')
  doc.setGState(new (doc as any).GState({ opacity: 1 }))

  // Org label
  text('ONE TEAM ONE FOUNDATION', L, 38, { size: 8, color: '#c7d2fe', bold: true })

  // Title
  doc.setFontSize(22)
  doc.setTextColor('#ffffff')
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(project.title, INNER - 120)
  doc.text(titleLines, L, 62)
  const titleH = titleLines.length * 28

  // Description
  doc.setFontSize(9)
  doc.setTextColor('#c7d2fe')
  doc.setFont('helvetica', 'normal')
  const descLines = doc.splitTextToSize(project.description || '', INNER - 120)
  doc.text(descLines.slice(0, 2), L, 62 + titleH)

  // Status badge (top-right)
  const statusBg  = project.status === 'active' ? '#10b981' : project.status === 'completed' ? '#3b82f6' : '#f59e0b'
  rect(R - 90, 28, 90, 22, statusBg, 4)
  text(project.status.toUpperCase(), R - 45, 43, { size: 8, color: '#ffffff', bold: true, align: 'center' })

  // Generated date
  const genDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  text(`Generated: ${genDate}`, R, 60, { size: 8, color: '#a5b4fc', align: 'right' })

  // White divider line at bottom of header
  doc.setDrawColor('#ffffff')
  doc.setGState(new (doc as any).GState({ opacity: 0.2 }))
  doc.setLineWidth(0.5)
  doc.line(L, 172, R, 172)
  doc.setGState(new (doc as any).GState({ opacity: 1 }))

  y = 200

  // ── SECTION: PROJECT OVERVIEW ──────────────────────────────────────────────
  text('PROJECT OVERVIEW', L, y, { size: 8, color: '#6366f1', bold: true })
  doc.setDrawColor('#6366f1')
  doc.setLineWidth(1.5)
  doc.line(L, y + 4, L + 110, y + 4)
  y += 18

  // 3-column info grid
  const cols3 = INNER / 3
  const infoItems = [
    { label: 'CATEGORY',   value: project.category },
    { label: 'START DATE', value: new Date(project.startDate).toLocaleDateString('en-IN') },
    { label: 'END DATE',   value: new Date(project.endDate).toLocaleDateString('en-IN') },
    { label: 'TARGET',     value: fmt(project.targetAmount) },
    { label: 'RAISED',     value: fmt(project.raisedAmount) },
    { label: 'PROGRESS',   value: `${project.progress}%` },
  ]

  infoItems.forEach((item, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const cx  = L + col * cols3
    const cy  = y + row * 56

    rect(cx, cy, cols3 - 8, 48, '#f8fafc', 6)
    doc.setDrawColor('#e2e8f0')
    doc.setLineWidth(0.5)
    doc.roundedRect(cx, cy, cols3 - 8, 48, 6, 6, 'S')

    text(item.label, cx + 10, cy + 14, { size: 7, color: '#94a3b8', bold: true })
    text(item.value, cx + 10, cy + 32, { size: 12, color: '#1e293b', bold: true })
  })

  y += 2 * 56 + 16

  // ── FUNDING PROGRESS BAR ───────────────────────────────────────────────────
  checkY(70)
  text('FUNDING PROGRESS', L, y, { size: 8, color: '#6366f1', bold: true })
  doc.setDrawColor('#6366f1')
  doc.setLineWidth(1.5)
  doc.line(L, y + 4, L + 120, y + 4)
  y += 18

  rect(L, y, INNER, 14, '#f1f5f9', 7)
  const barW = Math.min((project.progress / 100) * INNER, INNER)
  if (barW > 0) {
    // Gradient simulation: two rects
    rect(L, y, barW * 0.5, 14, '#6366f1', 0)
    rect(L + barW * 0.5, y, barW * 0.5, 14, '#8b5cf6', 0)
    // Rounded caps
    doc.setFillColor('#6366f1')
    doc.circle(L + 7, y + 7, 7, 'F')
    if (barW > 14) {
      doc.setFillColor('#8b5cf6')
      doc.circle(L + barW - 7, y + 7, 7, 'F')
    }
  }

  y += 22
  text(`Raised: ${fmt(project.raisedAmount)}`, L, y, { size: 9, color: '#64748b' })
  text(`${project.progress}% of ${fmt(project.targetAmount)}`, R, y, { size: 9, color: '#6366f1', bold: true, align: 'right' })
  y += 24

  // ── MILESTONE ANALYTICS ────────────────────────────────────────────────────
  checkY(120)
  text('MILESTONE ANALYTICS', L, y, { size: 8, color: '#6366f1', bold: true })
  doc.setDrawColor('#6366f1')
  doc.setLineWidth(1.5)
  doc.line(L, y + 4, L + 130, y + 4)
  y += 18

  const completedMs  = milestones.filter(m => m.status === 'completed').length
  const inProgressMs = milestones.filter(m => m.status === 'in_progress').length
  const pendingMs    = milestones.filter(m => m.status === 'pending').length

  const statBoxes = [
    { label: 'Completed',   value: completedMs,  bg: '#d1fae5', text: '#065f46', accent: '#10b981' },
    { label: 'In Progress', value: inProgressMs, bg: '#e0e7ff', text: '#3730a3', accent: '#6366f1' },
    { label: 'Pending',     value: pendingMs,    bg: '#f1f5f9', text: '#475569', accent: '#94a3b8' },
  ]

  const boxW = INNER / 3
  statBoxes.forEach(({ label, value, bg, text: tc, accent }, i) => {
    const bx = L + i * boxW
    rect(bx, y, boxW - 8, 52, bg, 8)
    // accent left bar
    rect(bx, y, 4, 52, accent, 2)
    text(String(value), bx + 20, y + 28, { size: 22, color: tc, bold: true })
    text(label, bx + 20, y + 44, { size: 8, color: tc, bold: true })
  })
  y += 64

  // ── MILESTONES TABLE ───────────────────────────────────────────────────────
  if (milestones.length > 0) {
    checkY(60)
    text('MILESTONE DETAILS', L, y, { size: 8, color: '#6366f1', bold: true })
    doc.setDrawColor('#6366f1')
    doc.setLineWidth(1.5)
    doc.line(L, y + 4, L + 120, y + 4)
    y += 16

    // Table header
    rect(L, y, INNER, 24, '#f8fafc', 4)
    doc.setDrawColor('#e2e8f0')
    doc.setLineWidth(0.5)
    doc.roundedRect(L, y, INNER, 24, 4, 4, 'S')

    const cols = [
      { label: 'MILESTONE',  x: L + 10,          w: INNER * 0.38 },
      { label: 'PROGRESS',   x: L + INNER * 0.40, w: INNER * 0.22 },
      { label: 'DUE DATE',   x: L + INNER * 0.64, w: INNER * 0.18 },
      { label: 'STATUS',     x: L + INNER * 0.84, w: INNER * 0.16 },
    ]

    cols.forEach(c => text(c.label, c.x, y + 15, { size: 7, color: '#64748b', bold: true }))
    y += 24

    milestones.forEach((m, i) => {
      checkY(28)
      const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
      rect(L, y, INNER, 26, rowBg)
      doc.setDrawColor('#f1f5f9')
      doc.setLineWidth(0.3)
      doc.line(L, y + 26, R, y + 26)

      text(m.title, cols[0].x, y + 17, { size: 9, color: '#1e293b', bold: true, maxWidth: cols[0].w - 4 })
      text(`${m.currentValue}${m.unit} / ${m.targetValue}${m.unit}`, cols[1].x, y + 17, { size: 9, color: '#64748b' })
      text(new Date(m.dueDate).toLocaleDateString('en-IN'), cols[2].x, y + 17, { size: 9, color: '#64748b' })

      // Status pill
      const sBg  = m.status === 'completed' ? '#d1fae5' : m.status === 'in_progress' ? '#e0e7ff' : '#f1f5f9'
      const sTxt = m.status === 'completed' ? '#065f46' : m.status === 'in_progress' ? '#3730a3' : '#475569'
      const sLabel = m.status.replace('_', ' ')
      rect(cols[3].x, y + 7, 60, 14, sBg, 7)
      text(sLabel, cols[3].x + 30, y + 17, { size: 7, color: sTxt, bold: true, align: 'center' })

      y += 26
    })
    y += 12
  }

  // ── ASSIGNED TEAM ──────────────────────────────────────────────────────────
  if (project.assignedUsers?.length > 0) {
    checkY(80)
    text('ASSIGNED TEAM', L, y, { size: 8, color: '#6366f1', bold: true })
    doc.setDrawColor('#6366f1')
    doc.setLineWidth(1.5)
    doc.line(L, y + 4, L + 100, y + 4)
    y += 18

    const memberW = (INNER - 8) / 2
    project.assignedUsers.forEach((u, i) => {
      if (i % 2 === 0 && i > 0) y += 44
      checkY(44)
      const mx = i % 2 === 0 ? L : L + memberW + 8

      rect(mx, y, memberW, 38, '#f8fafc', 6)
      doc.setDrawColor('#e2e8f0')
      doc.setLineWidth(0.5)
      doc.roundedRect(mx, y, memberW, 38, 6, 6, 'S')

      // Avatar circle
      doc.setFillColor('#6366f1')
      doc.circle(mx + 22, y + 19, 13, 'F')
      text(u.name[0].toUpperCase(), mx + 22, y + 23, { size: 11, color: '#ffffff', bold: true, align: 'center' })

      text(u.name,  mx + 42, y + 16, { size: 10, color: '#1e293b', bold: true, maxWidth: memberW - 50 })
      text(u.email, mx + 42, y + 29, { size: 8,  color: '#94a3b8', maxWidth: memberW - 50 })
    })

    if (project.assignedUsers.length % 2 !== 0) y += 44
    else y += 44
    y += 8
  }

  // ── FINAL FOOTER on last page ──────────────────────────────────────────────
  drawPageFooter()

  doc.save(`${project.title.replace(/\s+/g, '_')}_Report.pdf`)
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const api = authService.getApi()

  const [projects,     setProjects]     = useState<Project[]>([])
  const [loading,      setLoading]      = useState(true)
  const [downloading,  setDownloading]  = useState<string | null>(null)
  const [milestoneMap, setMilestoneMap] = useState<Record<string, Milestone[]>>({})

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/projects')
      setProjects(data.projects)
    } catch {} finally { setLoading(false) }
  }, [api])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const getMilestones = async (projectId: string): Promise<Milestone[]> => {
    if (milestoneMap[projectId]) return milestoneMap[projectId]
    try {
      const { data } = await api.get(`/admin/milestones/project/${projectId}`)
      const ms: Milestone[] = data.milestones
      setMilestoneMap(prev => ({ ...prev, [projectId]: ms }))
      return ms
    } catch { return [] }
  }

  const handleDownload = async (project: Project) => {
    setDownloading(project._id)
    try {
      const milestones = await getMilestones(project._id)
      await generatePDF(project, milestones)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setDownloading(null)
    }
  }

  const totalFunding   = projects.reduce((s, p) => s + p.targetAmount, 0)
  const totalRaised    = projects.reduce((s, p) => s + p.raisedAmount, 0)
  const activeCount    = projects.filter(p => p.status === 'active').length
  const completedCount = projects.filter(p => p.status === 'completed').length

  return (
    <div className="p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Download per-project PDF reports with full analytics</p>
        </div>
        <button onClick={fetchProjects}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 transition-colors self-start">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: projects.length,  icon: FiFolder,     color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Active',         value: activeCount,       icon: FiTrendingUp, color: 'text-emerald-600',bg: 'bg-emerald-50'},
          { label: 'Completed',      value: completedCount,    icon: FiBarChart2,  color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Total Raised',   value: `₹${(totalRaised/100000).toFixed(1)}L`, icon: FiFlag, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`${bg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`${color} w-4 h-4`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall funding bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-gray-900 text-sm">Overall Funding Progress</p>
          <p className="text-sm font-bold text-indigo-600">
            {fmt(totalRaised)} / {fmt(totalFunding)}
          </p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${totalFunding > 0 ? Math.round((totalRaised / totalFunding) * 100) : 0}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {totalFunding > 0 ? Math.round((totalRaised / totalFunding) * 100) : 0}% of total target raised across all projects
        </p>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FiFolder className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {projects.length} Projects — Click Download to generate PDF
          </p>
          {projects.map(p => {
            const sc = statusColor[p.status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
            const isDownloading = downloading === p._id
            return (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <FiFolder className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm truncate">{p.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${sc.bg} ${sc.text}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 flex-shrink-0">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FiUsers className="w-3 h-3" /> {p.assignedUsers?.length || 0} members
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FiTrendingUp className="w-3 h-3" /> {p.progress}% funded
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FiCalendar className="w-3 h-3" />
                        {new Date(p.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(p)}
                    disabled={!!downloading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
