import { ArrowLeft, Sprout, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-5 pb-28 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif tracking-tight text-xl font-bold text-brand-text">About Fasal-Drishti</h1>
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4">
          <Sprout size={40} className="text-brand-green" strokeWidth={1.5} />
        </div>
        <h2 className="font-serif tracking-tight text-2xl font-bold text-brand-text">Fasal-Drishti</h2>
        <p className="text-sm text-brand-text-muted mt-1">v1.0.0 (Hackathon Edition)</p>
      </div>

      <div className="card p-5 mb-4">
        <h3 className="text-sm font-bold text-brand-text mb-2">About</h3>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          Fasal-Drishti is an AI-powered smart farming assistant that helps farmers monitor crop health, predict disease spread, and optimize pesticide usage using satellite imagery and weather data.
        </p>
      </div>

      <div className="card p-5 mb-4">
        <h3 className="text-sm font-bold text-brand-text mb-3">Key Features</h3>
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
        <h3 className="text-sm font-bold text-brand-text mb-2">Data Sources</h3>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          Sentinel-2 satellite imagery • OpenWeather API • India Meteorological Department • FAO crop database
        </p>
      </div>
    </div>
  );
}
