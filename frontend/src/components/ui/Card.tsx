import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-bg-alt border border-border-light rounded-xl p-6 transition-colors duration-200 hover:bg-surface hover:border-border-strong ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
