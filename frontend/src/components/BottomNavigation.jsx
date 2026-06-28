import { Home, Map, Activity, Bell, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home',    label: 'Home',       icon: Home,     path: '/home' },
    { id: 'map',     label: 'Map',        icon: Map,      path: '/map' },
    { id: 'diagnose',label: 'Diagnose',   icon: Activity, path: '/diagnose' },
    { id: 'alerts',  label: 'Alerts',     icon: Bell,     path: '/alerts' },
    { id: 'menu',    label: 'Menu',       icon: Menu,     path: '/menu' },
  ];

  const mainPaths = ['/home', '/map', '/diagnose', '/alerts', '/menu', '/settings', '/help', '/about', '/action-plan'];
  if (!mainPaths.includes(location.pathname)) return null;

  let active = 'home';
  if (location.pathname.startsWith('/map'))       active = 'map';
  if (location.pathname.startsWith('/diagnose') || location.pathname.startsWith('/action-plan')) active = 'diagnose';
  if (location.pathname.startsWith('/alerts'))    active = 'alerts';
  if (location.pathname.startsWith('/menu') || location.pathname.startsWith('/settings') || location.pathname.startsWith('/help') || location.pathname.startsWith('/about')) active = 'menu';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full md:w-64 md:h-screen md:top-0 md:left-0 z-[5000]"
      style={{
        background: 'rgba(26,31,22,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      }}
    >
      {/* MD: right border separator */}
      <div
        className="hidden md:block absolute top-0 right-0 h-full w-px"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />

      <div className="flex justify-between items-center px-3 py-1.5 md:flex-col md:justify-start md:items-stretch md:px-4 md:py-8 md:gap-1 md:h-full">
        {/* Desktop logo */}
        <div className="hidden md:flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-bold text-lg tracking-wide" style={{ color: '#8DB87A' }}>
            Fasal-Drishti
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col md:flex-row items-center md:justify-start gap-0.5 md:gap-3 min-w-[3.5rem] py-1.5 px-2 md:px-4 md:py-3 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? '#8DB87A' : 'rgba(138,144,128,0.7)',
                background: isActive ? 'rgba(107,174,85,0.1)' : 'transparent',
              }}
            >
              {isActive && (
                <span
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 md:w-0.5 md:h-5 md:top-1/2 md:-translate-y-1/2 md:left-0 md:-translate-x-0 rounded-full"
                  style={{ background: '#8DB87A' }}
                />
              )}
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} className="md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-[9px] md:text-sm font-semibold tracking-wide uppercase md:capitalize md:tracking-normal whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
