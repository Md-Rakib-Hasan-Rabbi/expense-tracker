export function LoadingScreen({ label = 'Loading your workspace...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
        <div className="gradient-frame mx-auto h-12 w-12 rounded-full" />
        <p className="mt-4 text-sm text-slate-300">{label}</p>
      </div>
    </div>
  );
}
