import React from 'react';
import NavRail from './NavRail';

interface DocumentShellProps {
  children: React.ReactNode;
}

export const DocumentShell: React.FC<DocumentShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      {/* Sidebar navigation */}
      <NavRail />

      {/* Main content container */}
      <main className="flex-1 flex justify-center px-4 md:px-8 py-8 pb-24 md:pb-8 overflow-y-auto">
        <div className="w-full max-w-[720px] flex flex-col gap-6 text-[16px] leading-[1.6] text-text-main">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DocumentShell;
