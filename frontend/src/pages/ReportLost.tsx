import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import { PracticeShell } from '../components/layout/PracticeShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getDog } from '../api/dogs';
import type { Dog } from '../api/dogs';
import { reportLost } from '../api/reports';

export const ReportLost: React.FC = () => {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();

  const [dog, setDog] = useState<Dog | null>(null);
  const [isLoadingDog, setIsLoadingDog] = useState(true);
  
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [lastSeenTime, setLastSeenTime] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDog = async () => {
      if (!dogId) return;
      try {
        const data = await getDog(dogId);
        setDog(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to retrieve dog details.');
      } finally {
        setIsLoadingDog(false);
      }
    };

    loadDog();
  }, [dogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogId) return;

    if (!lastSeenLocation.trim()) return setError('Please specify where the dog was last seen.');
    if (!lastSeenTime.trim()) return setError('Please specify when the dog went missing.');

    setIsSubmitting(true);
    setError(null);

    try {
      // Step-by-step progress logging for nice visual transition
      setLoadingStep('Drafting neighborhood broadcast script with Google Gemini...');
      
      // Artificial short delay to make the steps readable in UI
      await new Promise(r => setTimeout(r, 1200));
      
      setLoadingStep('Synthesizing high-fidelity audio alert with ElevenLabs...');
      
      const response = await reportLost(dogId, {
        lastSeenLocation,
        lastSeenTime,
        notes
      });

      setLoadingStep('Finalizing lost alert publication...');
      await new Promise(r => setTimeout(r, 600));

      navigate(`/alerts/${response.alertId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to publish lost report. Verify backend is running.');
      setIsSubmitting(false);
    }
  };

  if (isLoadingDog) {
    return (
      <PracticeShell>
        <div className="text-center py-12 text-text-muted font-bold">
          Retrieving dog record...
        </div>
      </PracticeShell>
    );
  }

  if (!dog) {
    return (
      <PracticeShell>
        <div className="text-center py-6 flex flex-col gap-4">
          <p className="text-danger font-bold">Dog record not found.</p>
          <Link to="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </PracticeShell>
    );
  }

  return (
    <PracticeShell>
      {isSubmitting ? (
        // Highly polished visual loading overlay for the AI generation steps
        <div className="py-12 flex flex-col items-center justify-center text-center gap-6 select-none">
          <div className="w-16 h-16 rounded-3xl bg-accent-soft text-accent flex items-center justify-center border border-accent/20 relative">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-text-main animate-pulse">
              Generating Alert Broadcast
            </h3>
            <p className="text-[14px] text-text-muted max-w-[320px] mx-auto leading-relaxed">
              {loadingStep}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-surface border border-border-strong rounded-xl cursor-pointer">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-text-main leading-tight">
                Report {dog.name} Lost
              </h2>
              <p className="text-[13px] text-text-muted">
                Broadcast a spoken voice alert to the community
              </p>
            </div>
          </div>

          <hr className="border-border-strong" />

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-[14px]">
              {error}
            </div>
          )}

          {/* Dog preview banner */}
          <div className="flex items-center gap-3 bg-surface/50 border border-border-light rounded-xl p-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border-strong bg-white">
              <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-[15px] text-text-main">{dog.name}</div>
              <div className="text-[12px] text-text-muted">{dog.breed} • {dog.size}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Last Seen Location (Neighborhood/Cross Streets)"
              placeholder="e.g. 5th Ave and 23rd St, Flatiron"
              value={lastSeenLocation}
              onChange={(e) => setLastSeenLocation(e.target.value)}
            />

            <Input
              label="Last Seen Time / Date"
              placeholder="e.g. 10:30 AM today, Saturday morning"
              value={lastSeenTime}
              onChange={(e) => setLastSeenTime(e.target.value)}
            />

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-muted select-none">
                Additional Notes / Description
              </label>
              <textarea
                placeholder="Describe collar color, behaviour (skittish/friendly), distinct traits, or contact notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="border border-border-light rounded-lg py-[10px] px-[14px] text-[16px] text-text-main bg-white placeholder-text-dim outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-150"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2">
              Generate & Publish Alert
            </Button>
          </form>
        </>
      )}
    </PracticeShell>
  );
};

export default ReportLost;
