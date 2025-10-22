export default function Hero() {
  return (
    <section id="get-started" className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--nexivo-surface)]/40 px-8 py-20 text-center shadow-2xl shadow-black/40">
      <div className="mx-auto max-w-3xl space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nexivo-text-secondary)]">
          Inbox Detox • AI Ops
        </span>
        <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
          Untangle chaotic inboxes with a human-grade AI copilot.
        </h1>
        <p className="text-balance text-lg text-[var(--nexivo-text-secondary)]">
          Nexivo triages, prioritises, and automates your email workflows so you can stay focused on high-impact work. Built for founders, operators, and busy teams.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#pricing"
            className="rounded-full bg-[var(--nexivo-primary)] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[var(--nexivo-primary)]/30 transition hover:-translate-y-0.5 hover:bg-[var(--nexivo-secondary)]"
          >
            Start free trial
          </a>
          <a
            href="#dashboard"
            className="rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white hover:text-white"
          >
            See live dashboard
          </a>
        </div>
      </div>
      <div className="pointer-events-none absolute -left-40 -top-32 h-72 w-72 rounded-full bg-[var(--nexivo-primary)]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[var(--nexivo-secondary)]/40 blur-3xl" />
    </section>
  )
}
