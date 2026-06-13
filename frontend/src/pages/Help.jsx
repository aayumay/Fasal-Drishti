import { ArrowLeft, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="pt-12 px-5 pb-10 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-brand-text">Help & Support</h1>
      </div>

      <div className="space-y-3">
        <a href="tel:+918000123456" className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Phone size={22} className="text-brand-green" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text text-sm">Helpline</h3>
            <p className="text-xs text-brand-text-muted">+91 8000 123 456</p>
          </div>
          <ExternalLink size={16} className="text-brand-text-muted ml-auto" />
        </a>

        <a href="mailto:support@fasaldrishti.in" className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Mail size={22} className="text-brand-accent" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text text-sm">Email</h3>
            <p className="text-xs text-brand-text-muted">support@fasaldrishti.in</p>
          </div>
          <ExternalLink size={16} className="text-brand-text-muted ml-auto" />
        </a>

        <a href="https://wa.me/918000123456" target="_blank" rel="noopener noreferrer" className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={22} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text text-sm">WhatsApp</h3>
            <p className="text-xs text-brand-text-muted">Chat with our agronomy team</p>
          </div>
          <ExternalLink size={16} className="text-brand-text-muted ml-auto" />
        </a>
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
