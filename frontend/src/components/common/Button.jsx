export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-600/25 mesh-pulse',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    danger: 'bg-rose-500 hover:bg-rose-400 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-700',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
