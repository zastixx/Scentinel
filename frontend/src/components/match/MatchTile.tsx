import React from 'react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface Dog {
  id: string;
  name: string;
  photo_url: string;
  breed: string;
  size: string;
}

interface MatchTileProps {
  matchId: string;
  confidence: number;
  reasoning: string;
  dog: Dog;
  onClick: (matchId: string) => void;
}

export const MatchTile: React.FC<MatchTileProps> = ({
  matchId,
  confidence,
  reasoning,
  dog,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(matchId)}
      className="bg-bg-alt border-2 border-border-strong rounded-2xl p-5 flex flex-col gap-4 cursor-pointer select-none transition-all duration-100 active:translate-y-[2px] active:shadow-none hover:bg-surface"
      style={{
        boxShadow: '0 4px 0 0 var(--border-strong)',
      }}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Dog Registered Thumbnail */}
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface shrink-0 border border-border-strong">
            <img
              src={dog.photo_url}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-[18px] font-bold text-text-main leading-snug">
              {dog.name}
            </h4>
            <p className="text-[14px] text-text-muted">
              {dog.breed} • {dog.size}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <Badge type="confidence" text={`${confidence}% Match`} />
      </div>

      {/* Confidence Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
          Match Confidence
        </div>
        <ProgressBar progress={confidence} context="xp" />
      </div>

      {/* Reasoning Snippet */}
      <div className="text-[14px] text-text-muted line-clamp-2 italic bg-white/40 border border-border-light rounded-xl p-3">
        "{reasoning}"
      </div>
    </div>
  );
};

export default MatchTile;
