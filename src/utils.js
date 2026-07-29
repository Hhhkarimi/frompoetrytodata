import { persianDigits, persianNumber } from './publication/persian-format.js';

export const faNumber = persianNumber;

export const faPercent = (value, digits = 1) =>
  `${faNumber(value, { minimumFractionDigits: digits, maximumFractionDigits: digits })}٪`;

export const faDigits = persianDigits;

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
