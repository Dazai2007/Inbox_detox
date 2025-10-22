const plans = [
  {
    name: 'Starter',
    price: '$0',
    cadence: 'per month',
    tagline: 'Ideal for early-stage founders and personal inbox clean-up.',
    features: ['1 inbox connection', 'Daily AI summaries', 'Bulk archive automation'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$29',
    cadence: 'per user / month',
    tagline: 'Collaborative triage for lean teams that need speed and guardrails.',
    features: ['Unlimited inboxes', 'Shared automations & playbooks', 'Slack + Asana integrations'],
    highlighted: true,
  },
  {
    name: 'Scale',
    price: 'Let’s talk',
    cadence: '',
    tagline: 'For enterprises with compliance, SSO, and custom workflow needs.',
    features: ['Dedicated success engineer', 'SOC2 & SSO', 'Custom data residency'],
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="space-y-10">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Pricing that scales with your focus.</h2>
        <p className="mx-auto max-w-2xl text-lg text-[var(--nexivo-text-secondary)]">
          Start free, upgrade when your team is ready for automation superpowers. Cancel anytime.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`card flex h-full flex-col gap-5 rounded-3xl border border-white/10 p-8 text-left transition duration-200 ${
              plan.highlighted ? 'bg-[var(--nexivo-primary)]/15 shadow-xl shadow-[var(--nexivo-primary)]/20' : 'bg-white/5'
            }`}
          >
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-[var(--nexivo-text-secondary)]">
                {plan.name}
              </span>
              <div className="mt-3 flex items-baseline gap-2 text-white">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.cadence && <span className="text-sm text-[var(--nexivo-text-secondary)]">{plan.cadence}</span>}
              </div>
              <p className="mt-3 text-sm text-[var(--nexivo-text-secondary)]">{plan.tagline}</p>
            </div>
            <ul className="space-y-2 text-sm text-white/90">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-auto rounded-full px-5 py-2 text-sm font-semibold transition ${
                plan.highlighted
                  ? 'bg-white text-slate-900 hover:-translate-y-0.5'
                  : 'border border-white/20 text-white hover:-translate-y-0.5 hover:border-white'
              }`}
            >
              {plan.highlighted ? 'Start Growth trial' : 'Contact sales'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
