import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { DocumentShell } from '../components/layout/DocumentShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMatch } from '../api/matches';
import type { Match } from '../api/matches';

export const MatchProof: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const reactLocation = useLocation();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read transaction info passed in route state, or fallback to fetching
  const state = reactLocation.state as { txHash: string; explorerUrl: string } | null;

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMatch(matchId);
        setMatch(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch match receipt details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (isLoading) {
    return (
      <DocumentShell>
        <div className="text-center py-12 text-text-muted font-bold">
          Retrieving blockchain proof receipt...
        </div>
      </DocumentShell>
    );
  }

  if (error || !match || !match.dog || !match.sighting) {
    return (
      <DocumentShell>
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 flex flex-col gap-3">
          <h4 className="font-bold text-[16px]">Receipt Not Found</h4>
          <p className="text-[14px]">{error || 'This match receipt does not exist.'}</p>
          <Link to="/" className="self-start">
            <Button variant="secondary">Back to Safety</Button>
          </Link>
        </div>
      </DocumentShell>
    );
  }

  const { dog, sighting } = match;
  const txHash = state?.txHash || match.tx_hash;
  const explorerUrl = state?.explorerUrl || match.explorer_url;

  return (
    <DocumentShell>
      {/* Visual Success Receipt Banner */}
      <div className="bg-accent-soft border border-accent/20 rounded-3xl p-8 text-center flex flex-col items-center gap-4 select-none">
        <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_4px_0_0_var(--accent-deep)]">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-accent-deep tracking-tight">
            Dog Safely Verified!
          </h2>
          <p className="text-[15px] text-text-muted font-bold mt-1 max-w-[420px] mx-auto">
            {dog.name} has been successfully matched. Verification proof is permanently logged on Solana Devnet.
          </p>
        </div>
      </div>

      {/* Main Proof Card Receipt */}
      <Card className="flex flex-col gap-5 p-6 md:p-8">
        <div className="flex items-center gap-2 text-text-muted select-none">
          <ShieldCheck size={18} className="text-accent" />
          <span className="text-[12px] font-bold uppercase tracking-wider">
            Solana Blockchain Receipt
          </span>
        </div>

        <hr className="border-border-light" />

        {/* Dog & Sighting Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
              Matched Dog
            </span>
            <div className="flex items-center gap-3 bg-surface/50 border border-border-light rounded-xl p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border-strong bg-white">
                <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-[15px] text-text-main leading-tight">{dog.name}</div>
                <div className="text-[12px] text-text-muted">{dog.breed} • {dog.size}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
              Sighting Spot
            </span>
            <div className="flex items-center gap-3 bg-surface/50 border border-border-light rounded-xl p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border-strong bg-white">
                <img src={sighting.photo_url} alt="Sighting" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-[15px] text-text-main leading-tight">Spotted Stray</div>
                <div className="text-[12px] text-text-muted">{sighting.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Timestamp */}
        <div className="flex items-center justify-between text-[14px] text-text-muted bg-surface/30 border border-border-light rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="font-semibold text-text-main">Log Timestamp</span>
          </div>
          <span className="font-mono">{new Date(match.created_at).toLocaleString()}</span>
        </div>

        {/* Transaction details */}
        {txHash ? (
          <div className="flex flex-col gap-3 bg-surface/30 border border-border-light rounded-xl p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider select-none">
                Transaction Hash
              </span>
              <span className="font-mono text-[13px] break-all select-all text-text-main bg-white/60 p-2.5 rounded-lg border border-border-light">
                {txHash}
              </span>
            </div>

            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex self-start items-center gap-1.5 text-[14px] font-bold text-accent hover:text-accent-hover transition-colors mt-1"
              >
                View in Solana Explorer <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-[14px] font-medium">
            Warning: Transaction details not found on database record.
          </div>
        )}
      </Card>

      {/* Done CTA */}
      <div className="flex justify-end gap-3 mt-4">
        <Link to="/dashboard">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
        <Link to="/">
          <Button variant="primary" className="flex items-center gap-1.5">
            Back to Home <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </DocumentShell>
  );
};

export default MatchProof;
