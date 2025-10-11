import { useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { getConnectUrl, getGmailStatus, disconnectGmail } from '../api/gmail'
import { useI18n } from '../context/I18nContext'
import Sparkline from '../components/Sparkline'

interface Email { id: number; subject?: string; content: string; summary?: string; category?: string; confidence_score?: number; created_at: string }
type UsageTotals = { total_analyses: number; month_analyses: number; quota_limit: number }
type DailyPoint = { date: string; count: number }
type UsageDaily = { data: DailyPoint[] }

export default function Dashboard(){
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const [emails, setEmails] = useState<Email[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<'online' | 'offline' | 'checking'>('checking')

  // Search & pagination state
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minConf, setMinConf] = useState<number | ''>('')
  const [usage, setUsage] = useState<UsageTotals | null>(null)
  const [series, setSeries] = useState<DailyPoint[] | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null)

  const load = async () => {
    setListLoading(true)
    setError(null)
    try {
  const endpoint = (q?.trim() || category || dateFrom || dateTo || minConf !== '') ? '/emails/search' : '/emails'
      const params: any = { page, page_size: pageSize }
      if (q?.trim()) params.q = q.trim()
      if (category) params.category = category
  if (dateFrom) params.date_from = dateFrom
  if (dateTo) params.date_to = dateTo
  if (minConf !== '' && !Number.isNaN(Number(minConf))) params.min_confidence = Number(minConf)
      const res = await client.get(endpoint, { params })
      const payload = res.data
      const data = Array.isArray(payload) ? payload : payload?.data
      const meta = Array.isArray(payload) ? undefined : payload?.pagination
      setEmails(Array.isArray(data) ? data : [])
      if (meta) {
        setTotal(meta.total ?? 0)
        setPages(meta.pages ?? 1)
      } else {
        setTotal(Array.isArray(data) ? data.length : 0)
        setPages(1)
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Failed to load emails')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => { load() }, [q, category, page, pageSize])

  // Health badge ping
  useEffect(() => {
    let mounted = true
    const ping = async () => {
      try {
        setHealth('checking')
        await client.get('/health', { timeout: 4000 })
        if (mounted) setHealth('online')
      } catch {
        if (mounted) setHealth('offline')
      }
    }
    ping()
    const t = setInterval(ping, 30000)
    return () => { mounted = false; clearInterval(t) }
  }, [])

  // Gmail status
  useEffect(() => {
    let mounted = true
    const loadStatus = async () => {
      try {
        const st = await getGmailStatus()
        if (mounted) setGmailConnected(!!st.connected)
      } catch {
        if (mounted) setGmailConnected(false)
      }
    }
    loadStatus()
  }, [])

  // Fetch analytics (KPIs + 30-day series)
  useEffect(() => {
    let mounted = true
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true)
        const [s, d] = await Promise.all([
          client.get('/analytics/usage/summary').catch(() => null),
          client.get('/analytics/usage/daily').catch(() => null)
        ])
        if (!mounted) return
        if (s?.data) setUsage(s.data as UsageTotals)
        if (d?.data?.data) setSeries((d.data as UsageDaily).data)
      } finally {
        if (mounted) setAnalyticsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const analyze = async () => {
    setLoading(true)
    try {
      await client.post('/emails/analyze', { subject, content })
      setSubject(''); setContent('')
      // After analyzing, refresh current page, and if we were on an empty page, go to first
      if (page > 1 && emails.length === 0) setPage(1)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const connectGmail = async () => {
    const url = await getConnectUrl()
    window.location.href = url
  }

  // Example presets for empty state
  const examples = useMemo(() => ([
    {
      title: 'Invoice from Acme Inc.',
      subject: 'Invoice #INV-2025-1024 due Oct 30',
      content:
        'Hello,\n\nPlease find attached your invoice #INV-2025-1024 for $249.00 due on Oct 30. If you have any questions, reply to this email.\n\nThanks,\nAcme Billing',
    },
    {
      title: 'Meeting request',
      subject: 'Can we meet next Tuesday at 14:00?',
      content:
        'Hey,\n\nCan we meet next Tuesday at 14:00 to review the Q4 roadmap and deliverables? I will send a calendar invite if that works.\n\nBest,\nAlex',
    },
    {
      title: 'Newsletter',
      subject: 'October Product Updates and Tips',
      content:
        'Welcome to our October newsletter! This month, we shipped dark mode, improved performance by 30%, and added new keyboard shortcuts. Read on for tips and how-tos.',
    },
    {
      title: 'Order confirmation',
      subject: 'Your order #123456 has been shipped',
      content:
        'Great news! Your order #123456 has shipped. Estimated delivery: Wednesday. Track your package using the link inside.',
    },
    {
      title: 'Security alert',
      subject: 'New login from Chrome on Windows',
      content:
        'We noticed a new login to your account from Chrome on Windows. If this was you, no action is needed. Otherwise, reset your password.',
    },
    {
      title: 'Promotion campaign',
      subject: 'Save 40% this weekend only',
      content:
        'This weekend only: get 40% off on all accessories. Use code WEEKEND40 at checkout. Offer ends Sunday midnight.',
    },
  ]), [])

  const prefill = (ex: { subject: string; content: string }) => {
    setSubject(ex.subject)
    setContent(ex.content)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const quickAnalyze = async (ex: { subject: string; content: string }) => {
    setSubject(ex.subject)
    setContent(ex.content)
    await analyze()
  }

  // Category -> Tailwind badge colors
  const catClass = (c?: string) => {
    const map: Record<string, string> = {
      important: 'bg-rose-100 text-rose-700 border-rose-200',
      invoice: 'bg-amber-100 text-amber-700 border-amber-200',
      meeting: 'bg-sky-100 text-sky-700 border-sky-200',
      spam: 'bg-gray-200 text-gray-700 border-gray-300',
      newsletter: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      social: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      promotion: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      other: 'bg-slate-100 text-slate-700 border-slate-200',
    }
    if (!c) return 'bg-slate-100 text-slate-700 border-slate-200'
    return map[c] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const categories = ['important','invoice','meeting','spam','newsletter','social','promotion','other']

  return (
    <div className="container my-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-3">
          <span
            className={`badge ${
              health === 'online' ? 'badge-success' :
              health === 'offline' ? 'badge-danger' :
              'badge-warn'
            }`}
            title={health === 'offline' ? 'Backend offline. Check if API is running on VITE_API_URL.' : 'Backend health'}
          >
            {health === 'online' ? 'Online' : health === 'offline' ? 'Offline' : 'Checking…'}
          </span>
          {gmailConnected ? (
            <div className="flex items-center gap-2">
              <span className="badge badge-success">Gmail connected</span>
              <button onClick={async ()=> { await disconnectGmail(); setGmailConnected(false) }} className="px-3 py-2 border rounded hover:bg-white/5 transition">Disconnect</button>
            </div>
          ) : (
            <button onClick={connectGmail} className="btn-primary">Gmail'e Bağlan</button>
          )}
          <span className="text-sm text-muted">{user?.email}</span>
          <button onClick={logout} className="px-3 py-2 border rounded hover:bg-white/5 transition">Logout</button>
        </div>
      </div>

      {health === 'offline' && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
          API şu anda ulaşılmıyor. Lütfen backend'in çalıştığından emin olun (VITE_API_URL: { (import.meta as any).env?.VITE_API_URL || '/' }).
        </div>
      )}

      {/* KPI cards + sparkline (accent blue) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card card--accent p-4">
          <div className="text-xs uppercase text-muted">Total analyses</div>
          <div className="mt-1 text-3xl font-extrabold text-sky-400">{usage ? usage.total_analyses : (analyticsLoading ? '…' : 0)}</div>
        </div>
        <div className="card card--accent p-4">
          <div className="text-xs uppercase text-muted">This month</div>
          <div className="mt-1 text-3xl font-extrabold text-sky-400">{usage ? usage.month_analyses : (analyticsLoading ? '…' : 0)}</div>
        </div>
        <div className="card card--accent p-4">
          <div className="text-xs uppercase text-muted">Quota</div>
          <div className="mt-1 text-3xl font-semibold"><span className="">{usage ? usage.month_analyses : 0}</span><span className="text-muted">/{usage ? usage.quota_limit : '-'}</span></div>
          {usage && usage.quota_limit > 0 && (
            <div className="mt-2 h-2 w-full bg-white/10 rounded overflow-hidden">
              <div className="h-2 rounded bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${Math.min(100, Math.round((usage.month_analyses / usage.quota_limit) * 100))}%` }} />
            </div>
          )}
        </div>
        <div className="card card--accent p-4">
          <div className="text-xs uppercase text-muted">Last 30 days</div>
          <div className="mt-1">
            <Sparkline points={series || []} height={40} color="#38bdf8" />
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-sm text-muted mb-1">Search</label>
          <input className="input w-full" placeholder='subject or summary…' value={q} onChange={e=> { setPage(1); setQ(e.target.value) }} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Category</label>
          <select className="input" value={category} onChange={e=> { setPage(1); setCategory(e.target.value) }}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">From</label>
          <input type="date" className="input" value={dateFrom} onChange={e=> { setPage(1); setDateFrom(e.target.value) }} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">To</label>
          <input type="date" className="input" value={dateTo} onChange={e=> { setPage(1); setDateTo(e.target.value) }} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Min confidence</label>
          <input type="number" min={0} max={100} className="input w-28" value={minConf} onChange={e=> { setPage(1); const v = e.target.value; setMinConf(v === '' ? '' : Math.max(0, Math.min(100, Number(v)))) }} />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Page size</label>
          <select className="input" value={pageSize} onChange={e=> { setPage(1); setPageSize(parseInt(e.target.value) || 10) }}>
            {[10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button className="px-3 py-2 border rounded hover:bg-white/5 transition" onClick={()=> { setQ(''); setCategory(''); setDateFrom(''); setDateTo(''); setMinConf(''); setPage(1) }}>Reset</button>
      </div>

      <div className="grid gap-2 my-4">
        <input className="input" placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="input" placeholder='Email content...' value={content} onChange={e=>setContent(e.target.value)} rows={6} />
        <button className="btn-primary" onClick={analyze} disabled={loading || !content.trim()}>{loading? 'Analyzing...':'Analyze & Save'}</button>
      </div>

      {error && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      {listLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Loading emails…</div>
      ) : emails.length === 0 ? (
  <div className="card p-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white/90 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M1.5 6.75A2.25 2.25 0 0 1 3.75 4.5h16.5a2.25 2.25 0 0 1 2.25 2.25v.243a2.25 2.25 0 0 1-.879 1.781l-8.25 6.188a2.25 2.25 0 0 1-2.742 0L2.379 8.774A2.25 2.25 0 0 1 1.5 6.993V6.75Z" />
                <path d="M22.5 9.857v7.393a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25V9.857l8.121 6.09a3.75 3.75 0 0 0 4.558 0L22.5 9.857Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">No emails analyzed yet</h3>
            <p className="mt-1 text-muted">Paste an email above to analyze, or try one of the examples below.</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((ex) => (
              <div key={ex.title} className="card p-4 hover:shadow-lg transition">
                <div className="font-medium">{ex.title}</div>
                <div className="text-xs text-muted mt-1 line-clamp-3">{ex.content}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 rounded border hover:bg-white/5 transition" onClick={() => prefill({ subject: ex.subject, content: ex.content })}>Prefill</button>
                  <button className="btn-primary" onClick={() => quickAnalyze({ subject: ex.subject, content: ex.content })} disabled={loading}>{loading? 'Analyzing…':'Analyze now'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5/ bg-opacity-5 text-white/90">
               <tr>
              <th className="text-left p-2">Subject</th>
              <th className="text-left p-2">Summary</th>
                 <th className="p-2">Category</th>
              <th className="p-2">Confidence</th>
              <th className="p-2">Created</th>
                 <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {emails.map(e => (
                 <tr key={e.id} className="border-t border-white/10 hover:bg-white/5 transition">
                <td className="p-2">{e.subject || '-'}</td>
                <td className="p-2">{e.summary || '-'}</td>
                  <td className="text-center p-2">
                    {e.category ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full border ${catClass(e.category)}`}>{t(`cat.${e.category}`)}</span>
                    ) : '-'}
                  </td>
                <td className="text-center p-2">{e.confidence_score ?? '-'}</td>
                <td className="text-center p-2">{new Date(e.created_at).toLocaleString()}</td>
                   <td className="p-2 text-right">
                     <button
                       className="px-2 py-1 text-red-300 border border-red-300/40 rounded hover:bg-red-500/10 transition"
                       onClick={async ()=> {
                         if (!confirm(t('confirmDelete'))) return
                         try {
                           await client.delete(`/emails/${e.id}`)
                           await load()
                         } catch (err) {
                           setError('Delete failed')
                         }
                       }}
                     >{t('delete')}</button>
                   </td>
              </tr>
            ))}
          </tbody>
        </table>
          {/* Pagination controls */}
          <div className="flex items-center justify-between p-3 text-sm text-muted">
            <div>Page {page} of {pages} — {total} items</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-white/5 transition" disabled={page <= 1} onClick={()=> setPage(p => Math.max(1, p - 1))}>Prev</button>
              <button className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-white/5 transition" disabled={page >= pages} onClick={()=> setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
