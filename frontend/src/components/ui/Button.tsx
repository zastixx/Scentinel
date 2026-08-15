import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  style,
  ...props
}) => {
  let baseStyles = 'rounded-2xl py-[14px] px-[24px] font-bold text-[16px] transition-all duration-100 ease-out select-none outline-none';
  let variantStyles = '';
  let shadowStyle = {};

  if (variant === 'primary') {
    // Primary Button: Fill --accent (green), text white, tactile deep accent shadow
    variantStyles = 'bg-accent hover:bg-accent-hover text-white active:translate-y-[2px] active:shadow-none cursor-pointer';
    shadowStyle = {
      boxShadow: '0 4px 0 0 var(--accent-deep)',
    };
  } else if (variant === 'secondary') {
    // Secondary Button: Transparent, 2px --border-strong, text --text
    variantStyles = 'bg-transparent border-2 border-border-strong text-text-main hover:bg-bg-alt active:translate-y-[2px] active:shadow-none cursor-pointer';
    shadowStyle = {
      boxShadow: '0 4px 0 0 var(--border-strong)',
    };
  } else if (variant === 'danger') {
    // Danger Button (for emergency states like No matches found retry, etc.)
    variantStyles = 'bg-danger text-white hover:opacity-90 active:translate-y-[2px] active:shadow-none cursor-pointer';
    shadowStyle = {
      boxShadow: '0 4px 0 0 #b32d2d',
    };
  }

  // Handle disabled state
  if (props.disabled) {
    variantStyles = 'bg-border-strong text-text-dim cursor-not-allowed';
    shadowStyle = {};
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      style={{
        ...shadowStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
