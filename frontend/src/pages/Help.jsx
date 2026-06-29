import { ArrowLeft, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Help() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="pt-6 px-5 pb-28 h-full flex-1 overflow-y-auto" style={{ background: '#F8F6F2' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: '#1C2B1E', letterSpacing: '-0.02em' }}>
          {t('help_support')}
        </h1>
      </div>


      <div className="card p-5 mt-6">
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1C2B1E', marginBottom: '8px' }}>FAQs</h3>
        <p className="text-xs text-brand-text-muted leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
          How does the AI predict disease spread? The model uses Sentinel-2 satellite data combined with local weather forecasts to identify high-risk zones for fungal and pest outbreaks.
        </p>
      </div>
    </div>
  );
}
