import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Info, Camera, Share2 } from 'lucide-react';
import { DocumentShell } from '../components/layout/DocumentShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { getAlert, getActiveAlerts } from '../api/reports';
import type { Alert } from '../api/reports';

export const LostAlertPublic: React.FC = () => {
  const { id, dogId } = useParams<{ id?: string; dogId?: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const loadAlert = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (id) {
        const data = await getAlert(id);
        setAlert(data);
      } else if (dogId) {
        // Fetch active alerts and search for this dog
        const activeAlerts = await getActiveAlerts();
        const foundAlert = activeAlerts.find(a => a.dog_id === dogId || a.dog?.id === dogId);
        if (foundAlert) {
          setAlert(foundAlert);
        } else {
          setError('No active lost alert was found for this dog. They may have already been safely found!');
        }
      } else {
        setError('No alert reference provided.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not fetch public alert details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlert();
  }, [id, dogId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <DocumentShell>
        <div className="text-center py-12 text-text-muted font-bold">
          Loading lost alert page...
        </div>
      </DocumentShell>
    );
  }

  if (error || !alert || !alert.dog) {
    return (
      <DocumentShell>
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 flex flex-col gap-3">
          <h4 className="font-bold text-[16px]">Alert Not Found</h4>
          <p className="text-[14px]">
            {error || 'This lost dog report does not exist or has been resolved.'}
          </p>
          <Link to="/" className="self-start">
            <Button variant="secondary">Back to Safety</Button>
          </Link>
        </div>
      </DocumentShell>
    );
  }

  const { dog } = alert;

  return (
    <DocumentShell>
      {/* Alert Banner Indicator */}
      <div className="bg-danger text-white px-5 py-3 rounded-2xl flex items-center justify-between font-bold text-[14px] shadow-sm select-none animate-pulse">
        <span className="flex items-center gap-2">
          🚨 Active Neighborhood Alert
        </span>
        <span className="uppercase text-[12px] bg-white/20 px-2 py-0.5 rounded">
          Urgent
        </span>
      </div>

      {/* Main Grid Info */}
      <div className="flex flex-col md:flex-row gap-6 items-start mt-2">
        {/* Large Dog Image */}
        <div className="w-full md:w-[280px] h-[280px] rounded-2xl overflow-hidden bg-surface shrink-0 border border-border-strong shadow-sm">
          <img
            src={dog.photo_url}
            alt={dog.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dog Profile description details */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-text-main">
              {dog.name} is missing
            </h2>
            <p className="text-text-muted font-semibold mt-1">
              {dog.breed} • {dog.size}
            </p>
          </div>

          <div className="flex flex-col gap-3 text-[15px]">
            <div className="flex items-start gap-2.5">
              <MapPin className="text-streak shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold text-text-main">Last Seen Location: </span>
                <span className="text-text-muted">{alert.last_seen_location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="text-streak shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold text-text-main">Last Seen Time: </span>
                <span className="text-text-muted">{alert.last_seen_time}</span>
              </div>
            </div>

            {alert.notes && (
              <div className="flex items-start gap-2.5">
                <Info className="text-text-dim shrink-0 mt-0.5" size={18} />
                <div>
                  <span className="font-bold text-text-main">Owner Notes: </span>
                  <span className="text-text-muted italic">"{alert.notes}"</span>
                </div>
              </div>
            )}
          </div>

          {/* Share button */}
          <Button
            variant="secondary"
            onClick={handleShare}
            className="self-start flex items-center gap-2 py-2.5 px-4 text-[14px]"
          >
            <Share2 size={14} />
            {isCopied ? 'Link Copied!' : 'Copy Share Link'}
          </Button>
        </div>
      </div>

      {/* Spoken Alert Audio Player */}
      {alert.audio_url ? (
        <div className="flex flex-col gap-2 mt-4">
          <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
            Audio Announcement
          </span>
          <AudioPlayer src={alert.audio_url} />
        </div>
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl p-4 text-[14px] text-text-muted italic">
          Voice broadcast is currently rendering or not configured.
        </div>
      )}

      {/* Audio Text Transcript */}
      <Card className="flex flex-col gap-2">
        <span className="text-[12px] font-bold text-text-muted uppercase tracking-wider">
          Broadcast Script
        </span>
        <p className="text-[16px] italic leading-relaxed text-text-main">
          "{alert.alert_text}"
        </p>
      </Card>

      {/* Sighting CTA */}
      <div className="bg-bg-alt border-2 border-dashed border-border-strong rounded-3xl p-6 text-center flex flex-col items-center gap-4 mt-4">
        <div>
          <h4 className="text-lg font-bold text-text-main">Have you seen {dog.name}?</h4>
          <p className="text-[14px] text-text-muted max-w-[400px] mx-auto mt-1">
            If you spotted a dog in the neighborhood resembling {dog.name}, upload a sighting photo immediately. AI will cross-reference the details.
          </p>
        </div>
        <Link to="/report-sighting" state={{ targetDogId: dog.id }} className="w-full max-w-[280px]">
          <Button variant="primary" className="w-full flex items-center justify-center gap-2">
            <Camera size={16} /> Report Sighting
          </Button>
        </Link>
      </div>
    </DocumentShell>
  );
};

export default LostAlertPublic;
