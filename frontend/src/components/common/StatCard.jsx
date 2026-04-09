import { formatCurrency } from '../../utils/formatters';
import { Card } from './Card';

export function StatCard({ title, value, currency = 'USD', note, tone = 'cyan' }) {
  const toneClass = {
    cyan: 'text-cyan-300',
    rose: 'text-rose-300',
    emerald: 'text-emerald-300',
    violet: 'text-violet-300',
  }[tone] || 'text-cyan-300';

  return (
    <Card className="comet-overlay prism-float">
      <p className="text-xs uppercase tracking-widest text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${toneClass}`}>{formatCurrency(value, currency)}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </Card>
  );
}
