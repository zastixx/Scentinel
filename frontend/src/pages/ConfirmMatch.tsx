import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Link2, ShieldCheck, AlertCircle } from 'lucide-react';
import { PracticeShell } from '../components/layout/PracticeShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MatchReasoning } from '../components/match/MatchReasoning';
import { getMatch, confirmMatch } from '../api/matches';
import type { Match } from '../api/matches';

export const ConfirmMatch: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatchDetails = async () => {
    if (!matchId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMatch(matchId);
      setMatch(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to retrieve match details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatchDetails();
  }, [matchId]);

  const handleConfirm = async () => {
    if (!matchId) return;
    setIsConfirming(true);
    setError(null);
    try {
      // 1. Send confirmation request to backend (which writes to Solana devnet)
      const res = await confirmMatch(matchId);

      // 2. Redirect to match proof page
      navigate(`/matches/${matchId}/proof`, {
        state: {
          txHash: res.txHash,
          explorerUrl: res.explorerUrl
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Solana verification failed. Ensure RPC connection and funds.');
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <PracticeShell>
        <div className="text-center py-12 text-text-muted font-bold">
          Loading comparison dashboard...
        </div>
      </PracticeShell>
    );
  }

  if (error && !match) {
    return (
      <PracticeShell>
        <div className="text-center py-6 flex flex-col gap-4">
          <p className="text-danger font-bold">{error}</p>
          <Link to="/">
            <Button variant="secondary">Back Home</Button>
          </Link>
        </div>
      </PracticeShell>
    );
  }

  if (!match || !match.dog || !match.sighting) {
    return (
      <PracticeShell>
        <div className="text-center py-6">
          <p className="text-text-muted">Match details missing or corrupted.</p>
        </div>
      </PracticeShell>
    );
  }

  const { dog, sighting } = match;

  return (
    <PracticeShell>
      {isConfirming ? (
        // Polished loading screen explaining the blockchain logging steps
        <div className="py-12 flex flex-col items-center justify-center text-center gap-6 select-none">
          <div className="w-16 h-16 rounded-3xl bg-accent-soft text-accent flex items-center justify-center border border-accent/20">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-text-main">
              Verifying on Solana
            </h3>
            <p className="text-[14px] text-text-muted max-w-[320px] mx-auto leading-relaxed">
              Writing match hash, timestamp, and details to Solana Devnet memo program...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface border border-border-strong rounded-xl cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-text-main leading-tight">
                Confirm Match
              </h2>
              <p className="text-[13px] text-text-muted">
                Review photos and finalize blockchain record
              </p>
            </div>
          </div>

          <hr className="border-border-strong" />

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-[14px] leading-relaxed flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Side-by-Side Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
                Sighting Photo
              </span>
              <div className="w-full aspect-square bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={sighting.photo_url}
                  alt="Spotted stray dog"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
                Registered Photo
              </span>
              <div className="w-full aspect-square bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={dog.photo_url}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Match reasoning analysis */}
          <MatchReasoning confidence={match.confidence} reasoning={match.reasoning} />

          {/* Prompt confirmation description */}
          <p className="text-[13px] text-text-muted text-center leading-normal px-2">
            Confirming this match will update {dog.name}'s status to active, archive the lost alert, and store a permanent hash record on the Solana ledger.
          </p>

          {/* Confirm Button */}
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} /> Confirm Match & Log to Chain
          </Button>
        </>
      )}
    </PracticeShell>
  );
};

export default ConfirmMatch;
