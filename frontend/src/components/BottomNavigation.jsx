import { Home, Map, Activity, Bell, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { id: 'home',     label: t('nav_home'),      icon: Home,     path: '/home' },
    { id: 'map',      label: t('nav_map'),       icon: Map,      path: '/map' },
    { id: 'diagnose', label: t('nav_diagnose'),  icon: Activity, path: '/diagnose' },
    { id: 'alerts',   label: t('nav_alerts'),    icon: Bell,     path: '/alerts' },
    { id: 'menu',     label: t('nav_more'),      icon: Menu,     path: '/menu' },
  ];

  const mainPaths = ['/home', '/map', '/diagnose', '/alerts', '/menu', '/settings', '/help', '/about', '/action-plan'];
  if (!mainPaths.includes(location.pathname)) return null;

  let active = 'home';
  if (location.pathname.startsWith('/map'))       active = 'map';
  if (location.pathname.startsWith('/diagnose') || location.pathname.startsWith('/action-plan')) active = 'diagnose';
  if (location.pathname.startsWith('/alerts'))    active = 'alerts';
  if (location.pathname.startsWith('/menu') || location.pathname.startsWith('/settings') || location.pathname.startsWith('/help') || location.pathname.startsWith('/about')) active = 'menu';

  return (
    <>
      {/* ── Mobile bottom tab bar ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[5000]"
        style={{
          background: 'rgba(248,246,242,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(35,66,41,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex justify-around items-center px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200"
                style={{
                  color: isActive ? '#234229' : '#B0BDB2',
                  background: isActive ? 'rgba(35,66,41,0.07)' : 'transparent',
                  minWidth: '52px',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop elegant sidebar ── */}
      <div
        className="hidden md:flex fixed top-0 left-0 h-screen w-64 z-[5000] flex-col"
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid rgba(35,66,41,0.07)',
          boxShadow: '4px 0 24px rgba(35,66,41,0.04)',
        }}
      >
        {/* Logo */}
        <div className="px-7 pt-8 pb-6" style={{ borderBottom: '1px solid rgba(35,66,41,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: 'rgba(35,66,41,0.06)' }}
            >
              <img src="/fasal_logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#234229',
                  letterSpacing: '-0.01em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                Fasal-Drishti
              </span>
              <span style={{ fontSize: '10px', color: '#B0BDB2', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t('agri_intelligence')}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto no-scrollbar">
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#B0BDB2', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
            {t('main_menu')}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 text-left"
                style={{
                  color: isActive ? '#234229' : '#7A8A7C',
                  background: isActive ? 'rgba(35,66,41,0.07)' : 'transparent',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 w-0.5 rounded-r-full"
                    style={{ height: '24px', background: '#234229' }}
                  />
                )}
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.7} style={{ flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(35,66,41,0.06)' }}>
          <p style={{ fontSize: '11px', color: '#B0BDB2', fontWeight: 500 }}>© 2025 Fasal-Drishti</p>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
