import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { PracticeShell } from '../components/layout/PracticeShell';
import { MatchTile } from '../components/match/MatchTile';
import { Button } from '../components/ui/Button';

interface Dog {
  id: string;
  name: string;
  photo_url: string;
  breed: string;
  size: string;
}

interface SightingMatch {
  id: string;
  confidence: number;
  reasoning: string;
  dog: Dog;
}

export const MatchResults: React.FC = () => {
  const reactLocation = useLocation();
  const navigate = useNavigate();

  const state = reactLocation.state as {
    sightingId: string;
    sightingPhotoUrl: string;
    matches: SightingMatch[];
    targetDogId?: string;
  } | null;

  if (!state) {
    return (
      <PracticeShell>
        <div className="text-center py-12 flex flex-col gap-4">
          <p className="text-text-muted font-bold">No sighting details found in history.</p>
          <Link to="/report-sighting">
            <Button variant="primary">Report Sighting</Button>
          </Link>
        </div>
      </PracticeShell>
    );
  }

  const { sightingId, sightingPhotoUrl, matches } = state;

  const handleMatchSelect = (matchId: string) => {
    navigate(`/confirm-match/${matchId}`);
  };

  return (
    <PracticeShell>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/report-sighting')}
          className="p-2 hover:bg-surface border border-border-strong rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-main leading-tight">
            Comparison Results
          </h2>
          <p className="text-[13px] text-text-muted">
            Gemini AI comparison matches against active reports
          </p>
        </div>
      </div>

      <hr className="border-border-strong" />

      {/* Sighting Photo Preview */}
      <div className="flex items-center gap-4 bg-surface/50 border border-border-light rounded-2xl p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface shrink-0 border border-border-strong">
          <img
            src={sightingPhotoUrl}
            alt="Sighting spotted"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Your Uploaded Sighting
          </div>
          <h4 className="font-bold text-[16px] text-text-main mt-0.5">Spotted Stray Dog</h4>
          <p className="text-[13px] text-text-muted mt-1 leading-snug">
            Features analyzed by Gemini comparison engine.
          </p>
        </div>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        // Real empty match / no-matches-found state using danger color token
        <div className="flex flex-col gap-5">
          <div className="bg-danger/10 border-2 border-danger/20 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-danger">No Active Matches Found</h4>
              <p className="text-[14px] text-text-muted mt-1 leading-relaxed">
                Gemini analyzed active lost alerts and did not detect any significant visual match. The sighting has been registered so owners can review it.
              </p>
            </div>
          </div>
          <Link to="/" className="w-full">
            <Button variant="secondary" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-[12px] font-bold text-text-muted uppercase tracking-wider select-none">
            <span>Potential Match Candidates ({matches.length})</span>
            <span className="text-accent flex items-center gap-1">
              <Sparkles size={12} fill="currentColor" /> Sorted by Confidence
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {matches.map((match) => (
              <MatchTile
                key={match.id}
                matchId={match.id}
                confidence={match.confidence}
                reasoning={match.reasoning}
                dog={match.dog}
                onClick={handleMatchSelect}
              />
            ))}
          </div>
        </div>
      )}
    </PracticeShell>
  );
};

export default MatchResults;
