import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

const palette = ['#22d3ee', '#818cf8', '#f472b6', '#34d399', '#f59e0b', '#fb7185'];

export function ExpensePieChart({ data, currency = 'USD' }) {
  const chartData = (data || []).map((item, index) => ({
    name: item.categoryName,
    value: item.total,
    color: palette[index % palette.length],
  }));

  return (
    <Card title="Expense by Category" className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={105} innerRadius={55}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
