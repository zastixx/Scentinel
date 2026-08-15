import React, { useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface DogFormData {
  name: string;
  breed: string;
  size: string;
  homeArea: string;
  ownerContact: string;
  photoUrl: string;
}

interface DogFormProps {
  onSubmit: (data: DogFormData, photoFile: File | null) => Promise<void>;
  isLoading?: boolean;
}

export const DogForm: React.FC<DogFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<DogFormData>({
    name: '',
    breed: '',
    size: 'Medium',
    homeArea: '',
    ownerContact: '',
    photoUrl: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      
      setError('');
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
    setError('');

    if (!formData.name.trim()) return setError('Dog Name is required.');
    if (!formData.breed.trim()) return setError('Breed is required.');
    if (!formData.homeArea.trim()) return setError('Home Area neighborhood is required.');
    if (!formData.ownerContact.trim()) return setError('Owner Contact is required.');
    if (!photoFile && !formData.photoUrl.trim()) {
      return setError('Please upload a dog photo or provide a photo URL.');
    }

    try {
      await onSubmit(formData, photoFile);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 flex items-center gap-2 text-[14px]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Photo Upload Area */}
      <div className="flex flex-col items-center gap-3">
        <label className="text-[14px] font-bold text-text-muted select-none self-start">
          Dog Photo
        </label>
        <div className="relative w-full h-48 bg-surface rounded-2xl border border-border-strong flex flex-col items-center justify-center overflow-hidden group hover:border-accent transition-colors duration-200">
          {photoPreview || formData.photoUrl ? (
            <>
              <img
                src={photoPreview || formData.photoUrl}
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

        {/* URL Input Fallback */}
        <div className="w-full">
          <Input
            label="Or Photo URL"
            name="photoUrl"
            placeholder="https://example.com/dog.jpg"
            value={formData.photoUrl}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Dog Name"
          name="name"
          placeholder="Buddy, Max, Bella..."
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Input
          label="Breed"
          name="breed"
          placeholder="Golden Retriever, Pug..."
          value={formData.breed}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-[14px] font-bold text-text-muted select-none">
            Size
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={handleChange}
            disabled={isLoading}
            className="border border-border-light rounded-lg py-[10px] px-[14px] text-[16px] text-text-main bg-white outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-150"
          >
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </select>
        </div>

        <Input
          label="Home Area (Neighborhood)"
          name="homeArea"
          placeholder="Greenwood, Brooklyn..."
          value={formData.homeArea}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <Input
        label="Owner Contact Info (Phone / Email)"
        name="ownerContact"
        placeholder="e.g. +1 555-0199 or owner@gmail.com"
        value={formData.ownerContact}
        onChange={handleChange}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? 'Registering Dog...' : 'Register Dog'}
      </Button>
    </form>
  );
};

export default DogForm;
