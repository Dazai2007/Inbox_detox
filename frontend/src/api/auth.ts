import client from './client'

export async function forgotPassword(email: string): Promise<void> {
  await client.post('/api/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await client.post('/api/auth/reset-password', { token, new_password: newPassword })
}
