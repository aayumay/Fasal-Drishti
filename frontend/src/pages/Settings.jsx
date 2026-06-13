import { ArrowLeft, Bell, Map, Globe, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Settings() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState('metric');
  const [alerts, setAlerts] = useState(true);
  const [lang, setLang] = useState('en');

  return (
    <div className="pt-12 px-5 pb-10 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-brand-text">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-brand-text mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Map size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">Units</span>
              </div>
              <select value={unit} onChange={e => setUnit(e.target.value)} className="text-xs bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-text/10 outline-none text-brand-text font-medium">
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">Push Alerts</span>
              </div>
              <button onClick={() => setAlerts(!alerts)} className={`w-10 h-5 rounded-full transition-colors relative ${alerts ? 'bg-brand-green' : 'bg-brand-text/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${alerts ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">Language</span>
              </div>
              <select value={lang} onChange={e => setLang(e.target.value)} className="text-xs bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-text/10 outline-none text-brand-text font-medium">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-brand-text mb-4">Account</h3>
          <button onClick={() => navigate('/profile-setup')} className="w-full flex items-center justify-between py-2">
            <span className="text-sm text-brand-text">Edit Profile</span>
            <ChevronRight size={16} className="text-brand-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
