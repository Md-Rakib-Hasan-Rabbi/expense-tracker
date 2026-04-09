export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-xs font-medium uppercase tracking-wide text-slate-300">{label}</span> : null}
      <select
        className={`w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </label>
  );
}
