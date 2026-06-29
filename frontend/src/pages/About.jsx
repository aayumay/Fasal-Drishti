import { ArrowLeft, Sprout, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="pt-6 px-5 pb-28 h-full flex-1 overflow-y-auto" style={{ background: '#F8F6F2' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: '#1C2B1E', letterSpacing: '-0.02em' }}>
          {t('about_title')}
        </h1>
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 flex items-center justify-center mb-2 overflow-hidden">
          <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '24px', color: '#1C2B1E' }}>
          Fasal-Drishti
        </h2>
        <p className="text-sm text-brand-text-muted mt-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('app_version')}
        </p>
      </div>

      <div className="card p-5 mb-4">
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1C2B1E', marginBottom: '8px' }}>
          {t('about_title')}
        </h3>
        <p className="text-xs text-brand-text-muted leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Fasal-Drishti is an AI-powered smart farming assistant that helps farmers monitor crop health, predict disease spread, and optimize pesticide usage using satellite imagery and weather data.
        </p>
      </div>

      <div className="card p-5 mb-4">
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1C2B1E', marginBottom: '12px' }}>
          Key Features
        </h3>
        <div className="space-y-2.5">
          {['Real-time crop health monitoring', 'AI-based disease spread prediction', 'Precision pesticide calculator', 'Weather-based advisory', 'Satellite field mapping'].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <ShieldCheck size={14} className="text-brand-green flex-shrink-0" />
              <span className="text-xs text-brand-text-muted">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1C2B1E', marginBottom: '8px' }}>
          Data Sources
        </h3>
        <p className="text-xs text-brand-text-muted leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Sentinel-2 satellite imagery • OpenWeather API • India Meteorological Department • FAO crop database
        </p>
      </div>
    </div>
  );
}
