import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  context?: 'accent' | 'xp';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  context = 'accent',
  className = '',
}) => {
  // Constrain progress between 0 and 100
  const percentage = Math.min(Math.max(progress, 0), 100);

  const fillClass = context === 'xp' ? 'bg-xp' : 'bg-accent';

  return (
    <div className={`w-full bg-surface h-3 rounded-full overflow-hidden ${className}`}>
      <div
        className={`${fillClass} h-full rounded-full transition-all duration-500 ease-out relative`}
        style={{
          width: `${percentage}%`,
        }}
      >
        {/* Inner top highlight of 4px height */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-white/32 rounded-full"
          style={{ height: '4px' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
