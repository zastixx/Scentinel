import React from 'react';

interface BadgeProps {
  type: 'urgency' | 'confidence';
  text: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, text, className = '' }) => {
  const bgClass = type === 'urgency' ? 'bg-streak' : 'bg-xp';

  return (
    <span
      className={`inline-block rounded-full py-[6px] px-[12px] font-bold text-[14px] text-white tabular-nums select-none ${bgClass} ${className}`}
    >
      {text}
    </span>
  );
};

export default Badge;
