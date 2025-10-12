"use client"
import { useEffect, useState } from 'react'
import { analyticsDaily, analyticsSummary, gmailConnectUrl, gmailStatus } from '../../../lib/api'

export default function DashboardPage() {
  const [usage, setUsage] = useState<{ total_analyses: number, month_analyses: number, quota_limit: number } | null>(null)
  const [series, setSeries] = useState<{ date: string, count: number }[]>([])
  const [gmail, setGmail] = useState<{ connected: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      const [s, d, g] = await Promise.allSettled([analyticsSummary(), analyticsDaily(), gmailStatus()])
      if (s.status === 'fulfilled') setUsage(s.value)
      if (d.status === 'fulfilled') setSeries(d.value.data)
      if (g.status === 'fulfilled') setGmail(g.value)
    }
    run()
  }, [])

  const connect = async () => {
    setLoading(true)
    try {
      const url = await gmailConnectUrl()
      window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card p-4">
          <div className="text-sm text-muted">Total</div>
          <div className="text-2xl font-bold">{usage ? usage.total_analyses : '…'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">This month</div>
          <div className="text-2xl font-bold">{usage ? usage.month_analyses : '…'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-muted">Quota</div>
          <div className="text-2xl font-bold">{usage ? `${usage.month_analyses}/${usage.quota_limit}` : '…'}</div>
        </div>
      </div>
      <div className="mt-6 card p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Gmail</div>
          {gmail?.connected ? (
            <span className="text-green-400 text-sm">Connected</span>
          ) : (
            <button className="btn-primary" onClick={connect} disabled={loading}>{loading ? 'Connecting…' : 'Connect Gmail'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
