export function Card({ title, subtitle, actions, className = '', children }) {
  return (
    <section className={`rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 backdrop-blur-sm ${className}`}>
      {(title || subtitle || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-base font-semibold text-slate-100">{title}</h3> : null}
            {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
