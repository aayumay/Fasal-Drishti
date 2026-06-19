import { useState } from 'react';
import { LogOut, Info, Settings as SettingsIcon, HelpCircle, User, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  return (
    <div className="pt-6 px-5 pb-24 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif tracking-tight text-xl font-bold text-brand-text">Menu</h1>
      </div>

      <div className="space-y-3">
        <MenuItem icon={User} iconBg="bg-brand-green/10" iconColor="text-brand-green" title="My Profile" subtitle="Edit personal information" onClick={() => navigate('/profile-setup')} />
        <MenuItem icon={SettingsIcon} iconBg="bg-blue-500/10" iconColor="text-blue-500" title="Settings" subtitle="App preferences and units" onClick={() => navigate('/settings')} />
        <MenuItem icon={HelpCircle} iconBg="bg-brand-accent/10" iconColor="text-brand-accent" title="Help & Support" subtitle="Contact our agronomy team" onClick={() => navigate('/help')} />
        <MenuItem icon={Info} iconBg="bg-purple-500/10" iconColor="text-purple-500" title="About Fasal-Drishti" subtitle="Version 1.0 (Hackathon Edition)" onClick={() => navigate('/about')} />

        <div
          onClick={handleLogout}
          className="card flex items-center gap-4 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] mt-8 border border-brand-danger/10"
        >
          <div className="w-12 h-12 bg-brand-danger/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <LogOut size={22} className="text-brand-danger" />
          </div>
          <div>
            <h3 className="font-bold text-brand-danger">Logout</h3>
            <p className="text-xs text-brand-text-muted">Sign out of your account</p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl animate-scale-in">
            <div className="w-14 h-14 bg-brand-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-brand-danger" />
            </div>
            <h3 className="text-lg font-bold text-brand-text text-center mb-2">Logout</h3>
            <p className="text-sm text-brand-text-muted text-center mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-2.5 bg-brand-danger hover:bg-brand-danger-dark text-white font-bold rounded-xl transition-all active:scale-[0.98]">Logout</button>
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
        <h3 className="font-bold text-brand-text">{title}</h3>
        <p className="text-xs text-brand-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
