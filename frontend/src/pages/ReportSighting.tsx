import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';
import { PracticeShell } from '../components/layout/PracticeShell';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { uploadPhoto } from '../api/supabase';
import { reportSighting } from '../api/matches';

export const ReportSighting: React.FC = () => {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const targetDogId = reactLocation.state?.targetDogId as string | undefined;

  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG/JPG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      
      setError(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) return setError('Please specify where you spotted the dog.');
    if (!photoFile && !photoUrl.trim()) return setError('Please upload a photo of the spotted dog or provide a URL.');

    setIsLoading(true);

    try {
      let finalPhotoUrl = photoUrl;

      // 1. Upload photo to Supabase storage
      if (photoFile) {
        finalPhotoUrl = await uploadPhoto(photoFile, 'sighting-photos');
      }

      // 2. Post sighting to backend for Gemini comparison
      const response = await reportSighting({
        photo: finalPhotoUrl,
        location,
        notes: notes || ''
      });

      // 3. Redirect to match results page
      navigate('/match-results', {
        state: {
          sightingId: response.sightingId,
          sightingPhotoUrl: finalPhotoUrl,
          matches: response.matches,
          targetDogId // If the finder was looking for a specific dog
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
        'Sighting analysis failed. Ensure Supabase is configured and the Gemini API key is correct.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PracticeShell>
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-surface border border-border-strong rounded-xl cursor-pointer">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-text-main leading-tight">
            Report Sighting
          </h2>
          <p className="text-[13px] text-text-muted">
            Upload photo anonymously to match lost dogs
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Photo Upload Area */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-text-muted select-none">
            Spotted Dog Photo
          </label>
          <div className="relative w-full h-48 bg-surface rounded-2xl border border-border-strong flex flex-col items-center justify-center overflow-hidden group hover:border-accent transition-colors duration-200">
            {photoPreview || photoUrl ? (
              <>
                <img
                  src={photoPreview || photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="text-white" size={32} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-dim">
                <Camera size={40} />
                <span className="text-[14px] font-semibold">Upload Photo (Click to Browse)</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              disabled={isLoading}
            />
          </div>

          <Input
            label="Or Photo URL"
            placeholder="https://example.com/stray.jpg"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Where was the dog spotted?"
          placeholder="e.g. Near 8th St Subway entrance, or park lawn"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-[14px] font-bold text-text-muted select-none">
            Behavioral / Physical Notes
          </label>
          <textarea
            placeholder="e.g. Scared, running north, wearing a brown collar, limping on front paw..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="border border-border-light rounded-lg py-[10px] px-[14px] text-[16px] text-text-main bg-white placeholder-text-dim outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-150"
          />
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? 'Analyzing features via AI...' : 'Submit Sighting & Compare'}
        </Button>
      </form>
    </PracticeShell>
  );
};

export default ReportSighting;
