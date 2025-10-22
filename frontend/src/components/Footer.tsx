export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-8 text-sm text-[var(--nexivo-text-secondary)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-base font-semibold text-white">Nexivo</span>
          <p className="mt-2 max-w-sm text-sm">
            Built by operators who were done fighting inbox chaos. We ship fast, stay secure, and keep humans in the loop.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:text-right">
          <a href="mailto:contact@nexivo.ai" className="transition hover:text-white">contact@nexivo.ai</a>
          <div className="flex gap-4 sm:justify-end">
            <a href="#privacy" className="transition hover:text-white">Privacy</a>
            <a href="#security" className="transition hover:text-white">Security</a>
            <a href="#status" className="transition hover:text-white">Status</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Nexivo Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
