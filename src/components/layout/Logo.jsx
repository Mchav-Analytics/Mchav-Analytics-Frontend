// ============================================================================
// COMPONENTE DE LOGOTIPO OFICIAL DE MCHAV ANALYTICS
// ============================================================================

import React from 'react';

const Logo = ({ style, className = "", size = 38 }) => (
  <img 
    src="/Logo_sf.png" 
    alt="MCHAV Analytics Logo" 
    className={`object-contain transition-all outline-none ${className}`}
    style={{ 
      width: typeof size === 'number' ? `${size}px` : size, 
      height: typeof size === 'number' ? `${size}px` : size, 
      objectFit: 'contain',
      marginRight: '8px',
      ...style 
    }} 
  />
);

export default Logo;
