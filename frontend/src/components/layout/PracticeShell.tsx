import React from 'react';
import NavRail from './NavRail';

interface PracticeShellProps {
  children: React.ReactNode;
}

export const PracticeShell: React.FC<PracticeShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      {/* Sidebar navigation */}
      <NavRail />

      {/* Main content container */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-8 pb-24 md:pb-8 overflow-y-auto">
        <div className="w-full max-w-[480px] bg-bg md:bg-bg-alt border-0 md:border md:border-border-strong rounded-3xl p-4 md:p-8 flex flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PracticeShell;
