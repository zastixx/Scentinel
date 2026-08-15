import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShieldAlert, Dog, Camera } from 'lucide-react';

export const NavRail: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <Dog size={20} /> },
    { path: '/report-sighting', label: 'Report Sighting', icon: <Camera size={20} /> },
  ];

  return (
    <>
      {/* Sidebar Nav Rail for Desktop (width >= 768px) */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-border-strong bg-bg-alt h-screen sticky top-0 p-6 shrink-0">
        {/* App Title */}
        <div className="flex items-center gap-2 mb-8 select-none">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-black text-xl shadow-[0_3px_0_0_var(--accent-deep)]">
            S
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-text-main">
              Scentinel
            </h1>
            <p className="text-[12px] text-text-muted font-bold uppercase tracking-wider">
              Lost-Dog Network
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-[12px] rounded-xl font-bold text-[15px] select-none transition-all duration-100 border-2 ${
                  isActive
                    ? 'bg-accent-soft border-accent text-accent-deep translate-y-[1px]'
                    : 'bg-transparent border-transparent text-text-muted hover:bg-surface hover:text-text-main'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer note */}
        <div className="text-[11px] text-text-dim font-medium select-none">
          Scentinel © 2026<br />Solana Devnet Secure
        </div>
      </aside>

      {/* Bottom Tab Bar for Mobile (width < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg border-t border-border-strong flex items-center justify-around px-4 pb-safe z-50 shadow-[0_-4px_16px_rgba(55,53,47,0.06)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                isActive
                  ? 'text-accent'
                  : 'text-text-muted'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default NavRail;
