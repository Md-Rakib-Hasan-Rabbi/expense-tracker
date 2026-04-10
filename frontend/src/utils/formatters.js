export function formatCurrency(value, currency = 'BDT') {
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

export function toStartOfDayISO(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function toEndOfDayISO(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}
