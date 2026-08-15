import React from 'react';
import { ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';

interface MatchReasoningProps {
  confidence: number;
  reasoning: string;
}

export const MatchReasoning: React.FC<MatchReasoningProps> = ({ confidence, reasoning }) => {
  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return { label: 'High Confidence Match', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' };
    if (score >= 50) return { label: 'Possible Match', color: 'text-streak', bg: 'bg-streak/10', border: 'border-streak/20' };
    return { label: 'Low Confidence Match', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' };
  };

  const level = getConfidenceLevel(confidence);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${level.bg} ${level.color} border ${level.border}`}>
          {confidence >= 80 ? (
            <ShieldCheck size={24} />
          ) : confidence >= 50 ? (
            <Scale size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-text-main leading-tight">
            AI Sighting Analysis
          </h4>
          <p className={`text-[13px] font-bold ${level.color}`}>
            {level.label} ({confidence}%)
          </p>
        </div>
      </div>

      <hr className="border-border-light" />

      <div className="flex flex-col gap-2">
        <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
          Reasoning Details
        </span>
        <p className="text-[15px] leading-relaxed text-text-main text-justify">
          {reasoning}
        </p>
      </div>
    </Card>
  );
};

export default MatchReasoning;
