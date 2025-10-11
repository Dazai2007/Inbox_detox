import client from './client'

export async function getConnectUrl(): Promise<string> {
  const res = await client.get('/api/gmail/connect_url')
  return res.data.url as string
}

export async function getGmailStatus(): Promise<{ connected: boolean; token_expires_at: string | null }>{
  const res = await client.get('/api/gmail/status')
  return res.data
}

export async function disconnectGmail(): Promise<void> {
  await client.post('/api/gmail/disconnect')
}
