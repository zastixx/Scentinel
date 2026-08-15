import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PracticeShell } from '../components/layout/PracticeShell';
import { DogForm } from '../components/dog/DogForm';
import { uploadPhoto } from '../api/supabase';
import { registerDog } from '../api/dogs';
import { Button } from '../components/ui/Button';

export const RegisterDog: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any, photoFile: File | null) => {
    setIsLoading(true);
    setError(null);
    try {
      let finalPhotoUrl = formData.photoUrl;

      // 1. Upload photo to Supabase storage if a local file was selected
      if (photoFile) {
        finalPhotoUrl = await uploadPhoto(photoFile, 'dog-photos');
      }

      // 2. Call backend register API
      await registerDog({
        name: formData.name,
        photo: finalPhotoUrl,
        breed: formData.breed,
        size: formData.size,
        homeArea: formData.homeArea,
        ownerContact: formData.ownerContact
      });

      // 3. Save owner contact to browser storage so dashboard lists this dog
      localStorage.setItem('scentinel_owner_contact', formData.ownerContact);

      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to register dog. Make sure your backend and database keys are configured.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PracticeShell>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-surface border border-border-strong rounded-xl cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-text-main leading-tight">
            Register Dog
          </h2>
          <p className="text-[13px] text-text-muted">
            Add your dog to the Scentinel network
          </p>
        </div>
      </div>

      <hr className="border-border-strong" />

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-[14px]">
          {error}
        </div>
      )}

      <DogForm onSubmit={handleSubmit} isLoading={isLoading} />
    </PracticeShell>
  );
};

export default RegisterDog;
