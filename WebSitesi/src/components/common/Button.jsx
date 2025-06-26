import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  style = {},
  ...props 
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    opacity: disabled || loading ? 0.7 : 1,
    ...style
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)',
      color: '#1a1a1a'
    },
    secondary: {
      background: '#f8f9fa',
      color: '#666',
      border: '1px solid #e9ecef'
    },
    danger: {
      background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
      color: 'white'
    }
  };

  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: 12
    },
    medium: {
      padding: '12px 24px',
      fontSize: 14
    },
    large: {
      padding: '16px 32px',
      fontSize: 16
    }
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size]
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: 16,
          height: 16,
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};

export default Button;
