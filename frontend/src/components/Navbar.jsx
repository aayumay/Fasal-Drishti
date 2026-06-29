import React from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 md:left-64 right-0 z-[4999] px-5 md:px-8"
      style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(248,246,242,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(35,66,41,0.07)',
      }}
    >
      {/* Mobile: logo */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(35,66,41,0.06)' }}
        >
          <img src="/fasal_logo.png" alt="Logo" className="w-5 h-5 object-contain" />
        </div>
        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '16px',
            color: '#234229',
            letterSpacing: '-0.01em',
          }}
        >
          Fasal-Drishti
        </span>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all duration-200"
          style={{
            background: 'rgba(35,66,41,0.06)',
            border: '1px solid rgba(35,66,41,0.1)',
            color: '#2F5D3A',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
          }}
          title="AR Scanner"
        >
          <Scan size={14} strokeWidth={1.8} />
          <span className="hidden md:inline">Scan Crop</span>
        </button>
      </div>
    </nav>
  );
}
