const features = [
  {
    title: 'Smart triage',
    description:
      'Adaptive models sort, label, and flag critical emails in real time so you never miss an urgent thread.',
    icon: '⚡',
  },
  {
    title: 'AI reply drafts',
    description:
      'Generate polished responses from context, personalise with one click, and send without leaving your flow.',
    icon: '✉️',
  },
  {
    title: 'Autonomous clean-up',
    description:
      'Auto-archive noise, unsubscribe from spam, and batch routine actions with safe-guarded automations.',
    icon: '🧹',
  },
]

export default function Features() {
  return (
    <section id="features" className="space-y-12 text-left">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for operators who need clarity.</h2>
        <p className="max-w-2xl text-lg text-[var(--nexivo-text-secondary)]">
          Empower your team with an inbox assistant that learns your workflow, automates repetitive tasks, and keeps stakeholders in the loop automatically.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="card group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:border-[var(--nexivo-accent)]/80 hover:shadow-xl"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--nexivo-primary)]/20 text-2xl">
              {feature.icon}
            </span>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--nexivo-text-secondary)]">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
