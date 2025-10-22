const highlights = [
  {
    label: 'Critical alerts surfaced automatically',
    value: '99.3% signal accuracy',
  },
  {
    label: 'Hours reclaimed per user weekly',
    value: '6.5h saved',
  },
  {
    label: 'Automated clean-up actions executed',
    value: '12.4k/month',
  },
]

export default function Dashboard() {
  return (
    <section id="dashboard" className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div className="card relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/40">
          <h2 className="text-3xl font-semibold text-white">Command centre snapshot</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--nexivo-text-secondary)]">
            See exactly what matters: escalations, VIP senders, SLAs at risk, and automated workflows completing in real time. Drill into any conversation with audit-ready context.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="block text-xs uppercase tracking-wide text-[var(--nexivo-text-secondary)]">
                  {item.label}
                </span>
                <strong className="mt-2 block text-lg text-white">{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-[var(--nexivo-accent)]/30 blur-3xl" />
        </div>
        <div className="card flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div>
            <h3 className="text-2xl font-semibold text-white">Workflow automations</h3>
            <p className="mt-2 text-sm text-[var(--nexivo-text-secondary)]">
              Ship personalised replies, route leads, and update CRMs without leaving your keyboard. Guardrails ensure humans stay in control and approvals track every decision.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li>• Auto-draft replies for investors and key partners</li>
            <li>• Trigger Asana tasks when priority emails arrive</li>
            <li>• Broadcast daily digest summaries to Slack</li>
          </ul>
          <a
            href="#get-started"
            className="self-start rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[var(--nexivo-accent)]"
          >
            Explore live dashboard
          </a>
        </div>
      </div>
    </section>
  )
}
