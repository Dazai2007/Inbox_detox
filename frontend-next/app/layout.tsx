import './globals.css'
import Link from 'next/link'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="container flex items-center gap-4 py-3">
            <Link href="/" className="font-semibold">Nexa</Link>
            <Link href="/dashboard" className="text-blue-400">Dashboard</Link>
            <Link href="/settings" className="text-blue-400">Settings</Link>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
