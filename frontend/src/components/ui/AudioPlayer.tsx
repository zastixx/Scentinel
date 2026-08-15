import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from './Button';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error('Audio play failed:', err));
    }
  };

  useEffect(() => {
    // Reset player if source changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [src]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(current);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return;
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-bg-alt border border-border-strong rounded-2xl p-5 flex flex-col gap-4 select-none ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          type="button"
          onClick={togglePlay}
          variant="primary"
          className="w-12 h-12 flex items-center justify-center p-0 rounded-2xl cursor-pointer"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
        </Button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[12px] font-bold text-text-muted uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Volume2 size={14} className="text-accent" /> Lost Alert Broadcast
            </span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Scrub Track */}
          <div className="relative w-full flex items-center h-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleScrub}
              className="w-full h-2 rounded-full appearance-none bg-surface outline-none cursor-pointer accent-accent"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progress}%, var(--surface) ${progress}%, var(--surface) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
