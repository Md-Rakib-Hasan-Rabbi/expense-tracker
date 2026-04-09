export function EmptyState({ title, message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  );
}
