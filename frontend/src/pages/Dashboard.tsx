import { useEffect, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

interface Email { id: number; subject?: string; content: string; summary?: string; category?: string; confidence_score?: number; created_at: string }

export default function Dashboard(){
  const { user, logout } = useAuth()
  const [emails, setEmails] = useState<Email[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const res = await client.get('/emails?limit=50')
    setEmails(res.data)
  }

  useEffect(() => { load() }, [])

  const analyze = async () => {
    setLoading(true)
    try {
      await client.post('/emails/analyze', { subject, content })
      setSubject(''); setContent('')
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Dashboard</h2>
        <div>
          {user?.email} <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display:'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea placeholder='Email content...' value={content} onChange={e=>setContent(e.target.value)} rows={6} />
        <button onClick={analyze} disabled={loading || !content.trim()}>{loading? 'Analyzing...':'Analyze & Save'}</button>
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={{textAlign:'left'}}>Subject</th>
            <th style={{textAlign:'left'}}>Summary</th>
            <th>Category</th>
            <th>Confidence</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(e => (
            <tr key={e.id}>
              <td>{e.subject || '-'}</td>
              <td>{e.summary || '-'}</td>
              <td style={{textAlign:'center'}}>{e.category || '-'}</td>
              <td style={{textAlign:'center'}}>{e.confidence_score ?? '-'}</td>
              <td style={{textAlign:'center'}}>{new Date(e.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
