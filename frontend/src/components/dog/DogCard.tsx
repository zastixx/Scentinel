import React from 'react';
import { MapPin, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Dog {
  id: string;
  name: string;
  photo_url: string;
  breed: string;
  size: string;
  home_area: string;
  owner_contact: string;
  status: 'active' | 'lost';
}

interface DogCardProps {
  dog: Dog;
  onReportLost?: (dogId: string) => void;
}

export const DogCard: React.FC<DogCardProps> = ({ dog, onReportLost }) => {
  const isLost = dog.status === 'lost';

  return (
    <Card className="flex flex-col md:flex-row gap-5 items-start md:items-center">
      {/* Dog Photo */}
      <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-surface relative shrink-0 border border-border-strong">
        <img
          src={dog.photo_url}
          alt={dog.name}
          className="w-full h-full object-cover"
        />
        {isLost && (
          <div className="absolute top-2 right-2 bg-danger text-white rounded-full p-1.5 shadow-lg flex items-center justify-center animate-pulse">
            <AlertTriangle size={14} />
          </div>
        )}
      </div>

      {/* Dog Info */}
      <div className="flex-1 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold text-text-main leading-tight">
            {dog.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-full ${
              isLost
                ? 'bg-danger/10 text-danger border border-danger/20'
                : 'bg-accent/10 text-accent border border-accent/20'
            }`}
          >
            {isLost ? (
              <>
                <AlertTriangle size={12} /> Lost
              </>
            ) : (
              <>
                <CheckCircle size={12} /> Active & Safe
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[14px] text-text-muted">
          <div>
            <span className="font-semibold text-text-main">Breed:</span> {dog.breed}
          </div>
          <div>
            <span className="font-semibold text-text-main">Size:</span> {dog.size}
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <MapPin size={14} className="text-text-dim" />
            <span>Home Area: {dog.home_area}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
        {isLost ? (
          // If lost, link to the public lost alert page
          <Link to={`/alerts/dog/${dog.id}`} className="w-full">
            <Button variant="secondary" className="w-full text-center">
              View Public Alert
            </Button>
          </Link>
        ) : (
          // If active, show button to trigger "Report Lost"
          onReportLost && (
            <Button
              variant="primary"
              onClick={() => onReportLost(dog.id)}
              className="w-full"
            >
              Report Lost
            </Button>
          )
        )}
      </div>
    </Card>
  );
};

export default DogCard;
