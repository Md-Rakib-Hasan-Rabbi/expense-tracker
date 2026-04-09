export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export function toISODate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
