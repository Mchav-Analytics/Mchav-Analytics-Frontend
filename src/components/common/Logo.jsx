import React from 'react';
import logoImg from '../../assets/logo.jpg';

const Logo = ({ style, className = "", size = 38 }) => (
  <img 
    src={logoImg} 
    alt="MCHAV Analytics Logo" 
    className={`object-cover shadow-md transition-all ${className}`}
    style={{ 
      width: typeof size === 'number' ? `${size}px` : size, 
      height: typeof size === 'number' ? `${size}px` : size, 
      objectFit: 'cover',
      borderRadius: '10px',
      marginRight: '8px',
      ...style 
    }} 
  />
);

export default Logo;
