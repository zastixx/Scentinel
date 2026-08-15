import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Volume2, Search } from 'lucide-react';
import { DocumentShell } from '../components/layout/DocumentShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Home: React.FC = () => {
  return (
    <DocumentShell>
      {/* Hero Section */}
      <div className="text-center py-8 flex flex-col gap-4">
        <div className="inline-flex self-center w-16 h-16 rounded-3xl bg-accent items-center justify-center text-white font-black text-3xl shadow-[0_6px_0_0_var(--accent-deep)] mb-4">
          S
        </div>
        <h1 className="text-[44px] md:text-[56px] font-extrabold tracking-tight text-text-main leading-[1.05]">
          Scentinel
        </h1>
        <p className="text-xl md:text-2xl text-text-muted max-w-[600px] mx-auto font-medium leading-relaxed">
          The decentralized lost-dog verification network. Powered by AI and secured on the Solana blockchain.
        </p>
      </div>

      {/* Main Call to Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <Card className="flex flex-col gap-4 p-8 items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-bold text-text-main">For Dog Owners</h3>
            <p className="text-[15px] text-text-muted leading-relaxed">
              Register your dog securely on our system. If they ever go missing, instantly draft and broadcast a neighborhood voice alert.
            </p>
          </div>
          <Link to="/register-dog" className="w-full mt-4">
            <Button variant="primary" className="w-full">
              Register My Dog
            </Button>
          </Link>
        </Card>

        <Card className="flex flex-col gap-4 p-8 items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-2xl bg-xp/10 text-xp flex items-center justify-center">
              <Camera size={24} />
            </div>
            <h3 className="text-2xl font-bold text-text-main">Found a Stray?</h3>
            <p className="text-[15px] text-text-muted leading-relaxed">
              Spotted a lost dog? Snap a photo anonymously. Our Gemini AI compares features to instantly check against active lost alerts.
            </p>
          </div>
          <Link to="/report-sighting" className="w-full mt-4">
            <Button variant="secondary" className="w-full">
              Report Sighting
            </Button>
          </Link>
        </Card>
      </div>

      {/* Concept Breakdown */}
      <div className="flex flex-col gap-4 mt-8">
        <h2 className="text-2xl font-bold text-text-main border-b border-border-strong pb-3">
          How it Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-bold text-accent uppercase tracking-widest">
              Step 01
            </div>
            <h4 className="text-[18px] font-bold text-text-main">Spoken Audio Alert</h4>
            <p className="text-[14px] text-text-muted leading-relaxed">
              When reported missing, Gemini drafts an alert, and ElevenLabs renders a life-like voice broadcast that can be played by anyone.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-bold text-xp uppercase tracking-widest">
              Step 02
            </div>
            <h4 className="text-[18px] font-bold text-text-main">AI Feature Matching</h4>
            <p className="text-[14px] text-text-muted leading-relaxed">
              Gemini analyzes uploaded sighting photos side-by-side with lost records, calculating confidence scores and detailed visual explanations.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[12px] font-bold text-streak uppercase tracking-widest">
              Step 03
            </div>
            <h4 className="text-[18px] font-bold text-text-main">Blockchain Verification</h4>
            <p className="text-[14px] text-text-muted leading-relaxed">
              Confirmed matches are recorded permanently on the Solana devnet ledger with a secure transaction hash and explorer link.
            </p>
          </div>
        </div>
      </div>
    </DocumentShell>
  );
};

export default Home;
