import { useState } from 'react';
import { LogOut, Info, Settings as SettingsIcon, HelpCircle, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Menu() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <div className="pt-6 px-5 pb-24 h-full flex-1 overflow-y-auto" style={{ background: '#F8F6F2' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: '#1C2B1E', letterSpacing: '-0.02em' }}>
          {t('menu_title')}
        </h1>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <MenuItem icon={User} iconBg="bg-brand-green/10" iconColor="text-brand-green" title={t('my_profile')} subtitle={t('edit_personal_info')} onClick={() => navigate('/profile-setup')} />
        <MenuItem icon={SettingsIcon} iconBg="bg-blue-500/10" iconColor="text-blue-500" title={t('settings')} subtitle={t('settings_subtitle')} onClick={() => navigate('/settings')} />
        <MenuItem icon={HelpCircle} iconBg="bg-brand-accent/10" iconColor="text-brand-accent" title={t('help_support')} subtitle={t('contact_team')} onClick={() => navigate('/help')} />
        <MenuItem icon={Info} iconBg="bg-purple-500/10" iconColor="text-purple-500" title={t('about_app')} subtitle={t('app_version')} onClick={() => navigate('/about')} />
      </div>

      <div className="mt-16 mb-8 w-full md:w-auto md:max-w-[280px] mx-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-brand-danger/20 text-brand-danger bg-white rounded-2xl hover:bg-brand-danger hover:border-brand-danger hover:text-white transition-all font-bold shadow-sm group active:scale-[0.98]"
        >
          <LogOut size={20} className="text-brand-danger group-hover:text-white transition-colors" />
          <span className="tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('log_out')}</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl animate-scale-in">
            <div className="w-14 h-14 bg-brand-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-brand-danger" />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: '#1C2B1E', textAlign: 'center', marginBottom: '8px' }}>
              {t('log_out')}
            </h3>
            <p className="text-sm text-brand-text-muted text-center mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('logout_confirm_msg')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost flex-1">{t('cancel')}</button>
              <button onClick={confirmLogout} className="flex-1 py-2.5 bg-brand-danger hover:bg-brand-danger-dark text-white font-bold rounded-xl transition-all active:scale-[0.98]">
                {t('log_out')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, iconBg, iconColor, title, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <h3 className="font-bold text-brand-text" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px' }}>{title}</h3>
        <p className="text-xs text-brand-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
