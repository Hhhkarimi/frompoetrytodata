import React from 'react';

export default function Logo({ compact = false }) {
  return (
    <div className={`brand-logo ${compact ? 'brand-logo--compact' : ''}`} aria-label="از شعر تا داده">
      <svg className="brand-mark" viewBox="0 0 128 128" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b615c" />
            <stop offset="1" stopColor="#b9862d" />
          </linearGradient>
        </defs>
        <path d="M64 8 114 37v54L64 120 14 91V37Z" fill="url(#brandGradient)" />
        <path d="M64 28 87 56 64 99 41 56Z" fill="#fff8e8" />
        <circle cx="64" cy="60" r="8" fill="#9f2f38" />
        <path d="M64 68v23" stroke="#9f2f38" strokeWidth="6" strokeLinecap="round" />
        <circle cx="36" cy="42" r="5" fill="#f0cf79" />
        <circle cx="92" cy="42" r="5" fill="#f0cf79" />
        <path d="M40 44 56 55M88 44 72 55" stroke="#f0cf79" strokeWidth="3" />
      </svg>
      {!compact && (
        <div className="brand-copy">
          <strong>از شعر تا داده</strong>
          <span>اطلس تعاملی شعر فارسی</span>
        </div>
      )}
    </div>
  );
}
