export const faNumber = (value, options = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('fa-IR', options).format(Number(value));
};

export const faPercent = (value, digits = 1) =>
  `${faNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits })}٪`;

export const faDigits = (value) => String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const compactFa = (value) =>
  faNumber(value, { notation: 'compact', maximumFractionDigits: 1 });

export const centuryLabel = (value) => `سده ${faNumber(value)}`;

export const chartTextStyle = {
  fontFamily: 'Vazirmatn, sans-serif',
  color: '#4b5563',
};

export const chartColors = [
  '#0f766e', '#b45309', '#9f2f38', '#2563eb', '#7c3aed', '#c2410c',
  '#0e7490', '#4d7c0f', '#a21caf', '#475569', '#d97706',
];

export const downloadFile = (url) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  a.click();
};
