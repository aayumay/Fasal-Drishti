import React from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 md:left-64 right-0 z-[5000] px-4 py-3 bg-brand-bg/90 backdrop-blur-md border-b border-brand-text/5 shadow-sm">
      <div className="max-w-md md:max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-lg text-brand-green tracking-wide">Fasal-Drishti</span>
        </div>

        <div className="relative flex items-center gap-3">
          <button 
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center w-8 h-8 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-full transition-colors border border-brand-green/20 shadow-sm"
            title="AR Scanner"
          >
            <Scan size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
