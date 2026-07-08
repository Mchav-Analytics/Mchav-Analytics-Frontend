import React from 'react';

const Logo = ({ style }) => (
  <svg viewBox="0 0 200 200" style={{ width: '38px', height: '38px', marginRight: '8px', ...style }}>
    <defs>
      <linearGradient id="mchavLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="40%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="82" fill="none" stroke="url(#mchavLogoGrad)" strokeWidth="12" />
    <circle cx="100" cy="100" r="62" fill="none" stroke="url(#mchavLogoGrad)" strokeWidth="3" opacity="0.3" strokeDasharray="6 4" />
    <path d="M 50 120 C 65 95, 75 75, 85 105 C 95 130, 105 95, 122 70 L 145 42" fill="none" stroke="url(#mchavLogoGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 115 42 L 146 42 L 146 73" fill="none" stroke="url(#mchavLogoGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Logo;
