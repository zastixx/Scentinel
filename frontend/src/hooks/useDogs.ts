import { useState, useEffect, useCallback } from 'react';
import { getDogs, registerDog, RegisterDogPayload, Dog } from '../api/dogs';

export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dogs owned by this device
  const fetchMyDogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('scentinel_owner_contact');
      if (stored) {
        // Fetch dogs matching the owner contact saved in this browser
        const list = await getDogs(stored);
        setDogs(list);
      } else {
        setDogs([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch my dogs:', err);
      setError(err.message || 'Failed to load dog records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register a new dog and save owner contact locally
  const registerNewDog = async (payload: RegisterDogPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDog = await registerDog(payload);
      
      // Save contact to localStorage so we can retrieve this dog on reload
      localStorage.setItem('scentinel_owner_contact', payload.ownerContact);
      
      // Update local state
      setDogs((prev) => [newDog, ...prev]);
      return newDog;
    } catch (err: any) {
      console.error('Failed to register dog:', err);
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDogs();
  }, [fetchMyDogs]);

  return {
    dogs,
    isLoading,
    error,
    refreshDogs: fetchMyDogs,
    registerDog: registerNewDog
  };
}

export default useDogs;
