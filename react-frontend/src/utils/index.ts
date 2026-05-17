export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(isoString));
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9]{9,11}$/.test(phone.replace(/[\s\-]/g, ''));
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-');
}
