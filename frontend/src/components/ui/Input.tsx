import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[14px] font-bold text-text-muted select-none">
          {label}
        </label>
      )}
      <input
        className={`border border-border-light rounded-lg py-[10px] px-[14px] text-[16px] text-text-main bg-white placeholder-text-dim outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-150 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
