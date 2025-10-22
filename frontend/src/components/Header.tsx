const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <span className="logo logo-rb text-2xl font-semibold tracking-tight">Nexivo</span>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--nexivo-text-secondary)] md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cursor-pointer transition-colors hover:text-[var(--nexivo-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#get-started"
          className="rounded-full bg-[var(--nexivo-accent)] px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-[var(--nexivo-accent)]/30 transition hover:-translate-y-0.5 hover:bg-[var(--nexivo-secondary)] hover:text-white"
        >
          Get Started
        </a>
      </div>
      <div className="mx-auto hidden max-w-6xl border-b border-white/10 px-4 md:block" />
      <div className="mx-auto block max-w-6xl px-4 pb-3 text-xs text-[var(--nexivo-text-secondary)] md:hidden">
        <p>© {new Date().getFullYear()} Nexivo. All rights reserved.</p>
      </div>
    </header>
  )
}
