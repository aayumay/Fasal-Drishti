import React from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 md:left-64 right-0 z-[5000] px-4 py-3"
      style={{
        background: 'rgba(26,31,22,0.93)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="w-full flex justify-between md:justify-end items-center">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-base tracking-wide" style={{ color: '#8DB87A' }}>
            Fasal-Drishti
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{
              background: 'rgba(107,174,85,0.12)',
              border: '1px solid rgba(107,174,85,0.2)',
              color: '#8DB87A',
            }}
            title="AR Scanner"
          >
            <Scan size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
}
