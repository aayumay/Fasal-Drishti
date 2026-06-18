import { ArrowLeft, Bell, Map, Globe, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';

export default function Settings() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState('metric');
  const [alerts, setAlerts] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const { userName, saveUserName } = useUserContext();
  const [localName, setLocalName] = useState(userName || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalName(userName || '');
  }, [userName]);

  const handleSaveProfile = () => {
    saveUserName(localName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pt-6 px-5 pb-28 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-brand-text">{t('settings')}</h1>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-brand-text mb-4">{t('preferences')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Map size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">{t('units')}</span>
              </div>
              <select value={unit} onChange={e => setUnit(e.target.value)} className="text-xs bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-text/10 outline-none text-brand-text font-medium">
                <option value="metric">{t('metric')}</option>
                <option value="imperial">{t('imperial')}</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">{t('push_alerts')}</span>
              </div>
              <button onClick={() => setAlerts(!alerts)} className={`w-10 h-5 rounded-full transition-colors relative ${alerts ? 'bg-brand-green' : 'bg-brand-text/20'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${alerts ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-brand-text-muted" />
                <span className="text-sm text-brand-text">{t('language')}</span>
              </div>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="text-xs bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-text/10 outline-none text-brand-text font-medium">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-brand-text mb-4">{t('account')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-brand-text-muted text-xs font-medium mb-1.5">{t('farmer_name')}</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-brand-bg text-brand-text text-sm px-3 py-2 rounded-xl outline-none border border-brand-text/10 focus:border-brand-green/30 focus:ring-2 focus:ring-brand-green/10 transition-all" 
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder={t('enter_name')}
                />
                <button 
                  onClick={handleSaveProfile}
                  className="bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#3fb86e] transition-colors shadow-sm flex items-center gap-1"
                >
                  {saved ? <><Check size={14}/> {t('saved')}</> : t('save')}
                </button>
              </div>
            </div>
            
            <button onClick={() => navigate('/profile-setup')} className="w-full flex items-center justify-between py-2 pt-4 border-t border-brand-text/5">
              <span className="text-sm text-brand-text">{t('advanced_profile_setup')}</span>
              <ChevronRight size={16} className="text-brand-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
