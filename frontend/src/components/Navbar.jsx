import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'gu', label: 'ગુજરાતી' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-slate-900/60 backdrop-blur-md border-b border-slate-700/50 shadow-sm">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
            🌱
          </div>
          <span className="font-bold text-lg text-emerald-400 tracking-wide">Fasal-Drishti</span>
        </div>

        <div className="relative flex items-center gap-3">
          <button 
            onClick={() => navigate('/scanner')}
            className="flex items-center justify-center w-8 h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full transition-colors border border-emerald-500/30 shadow-sm"
            title="AR Scanner"
          >
            <Scan size={16} />
          </button>
          <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-sm font-medium px-3 py-1.5 rounded-full transition-colors border border-slate-700/50"
          >
            <Globe size={16} className="text-emerald-400" />
            <span>{currentLang.label}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl overflow-hidden py-1 animate-fade-in">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === lang.code ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'hover:bg-slate-700/50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
