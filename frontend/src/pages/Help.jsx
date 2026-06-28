import { ArrowLeft, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 px-5 pb-28 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif tracking-tight text-xl font-bold text-brand-text">Help & Support</h1>
      </div>


      <div className="card p-5 mt-6">
        <h3 className="text-sm font-bold text-brand-text mb-2">FAQs</h3>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          How does the AI predict disease spread? The model uses Sentinel-2 satellite data combined with local weather forecasts to identify high-risk zones for fungal and pest outbreaks.
        </p>
      </div>
    </div>
  );
}
