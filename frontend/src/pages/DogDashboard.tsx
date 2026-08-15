import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Search, ShieldAlert, Dog as DogIcon } from 'lucide-react';
import { DocumentShell } from '../components/layout/DocumentShell';
import { DogCard } from '../components/dog/DogCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getDogs } from '../api/dogs';
import type { Dog } from '../api/dogs';

export const DogDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ownerContact = localStorage.getItem('scentinel_owner_contact') || '';

  const loadDogs = async () => {
    if (!ownerContact) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDogs(ownerContact);
      setDogs(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dogs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDogs();
  }, [ownerContact]);

  const handleReportLost = (dogId: string) => {
    navigate(`/report-lost/${dogId}`);
  };

  return (
    <DocumentShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-strong pb-4">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">
            Dashboard
          </h2>
          <p className="text-[14px] text-text-muted">
            Manage your registered dogs and active lost reports
          </p>
        </div>
        {ownerContact && (
          <Link to="/register-dog">
            <Button variant="primary" className="flex items-center gap-2 py-3 px-4 rounded-xl cursor-pointer">
              <PlusCircle size={16} /> Register Another Dog
            </Button>
          </Link>
        )}
      </div>

      {/* Main Area */}
      {isLoading ? (
        <div className="text-center py-12 text-text-muted font-bold">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 flex flex-col gap-3">
          <h4 className="font-bold text-[16px]">Failed to Load Dashboard Data</h4>
          <p className="text-[14px]">{error}</p>
          <Button variant="secondary" onClick={loadDogs} className="self-start">
            Retry Connection
          </Button>
        </div>
      ) : !ownerContact || dogs.length === 0 ? (
        // Empty State
        <Card className="text-center py-12 px-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-text-dim border border-border-strong">
            <DogIcon size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-main">No Registered Dogs Found</h3>
            <p className="text-[14px] text-text-muted max-w-[400px] mx-auto mt-1">
              You haven't registered any dogs on this browser yet. Add a dog to enable secure matching and emergency audio broadcasts.
            </p>
          </div>
          <Link to="/register-dog">
            <Button variant="primary" className="mt-2 flex items-center gap-2">
              <PlusCircle size={16} /> Register a Dog
            </Button>
          </Link>
        </Card>
      ) : (
        // List of Owner's Dogs
        <div className="flex flex-col gap-4">
          <div className="text-[12px] font-bold text-text-muted uppercase tracking-wider select-none">
            Your Dogs ({dogs.length})
          </div>
          <div className="flex flex-col gap-4">
            {dogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                onReportLost={handleReportLost}
              />
            ))}
          </div>
        </div>
      )}
    </DocumentShell>
  );
};

export default DogDashboard;
