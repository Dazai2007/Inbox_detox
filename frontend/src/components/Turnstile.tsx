import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: any
  }
}

type Props = {
  siteKey: string
  onVerify: (token: string) => void
  theme?: 'auto' | 'light' | 'dark'
}

export default function Turnstile({ siteKey, onVerify, theme = 'auto' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    function render() {
      if (!mounted || !window.turnstile || !ref.current) return
      try {
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => onVerify(token),
          'error-callback': () => {
            setError('CAPTCHA yüklenemedi')
          },
          'timeout-callback': () => {
            setError('CAPTCHA zaman aşımına uğradı')
          },
          'unsupported-callback': () => {
            setError('Tarayıcı CAPTCHA için desteklenmiyor')
          }
        })
        setLoading(false)
      } catch {
        setError('CAPTCHA başlatılamadı')
      }
    }

    // load script if not present
    if (!window.turnstile) {
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.onload = () => render()
      s.onerror = () => setError('CAPTCHA script yüklenemedi')
      document.head.appendChild(s)
    } else {
      render()
    }

    return () => { mounted = false }
  }, [siteKey, onVerify, theme])

  return (
    <div>
      <div ref={ref} />
      {loading && !error && (
        <div className="mt-2 h-10 w-60 animate-pulse rounded bg-gray-200" />
      )}
      {error && (
        <div className="mt-2 text-xs text-red-600">{error}</div>
      )}
    </div>
  )
}