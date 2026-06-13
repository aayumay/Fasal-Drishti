import { Home, Map, Activity, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomNavigation = ({ active }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'map', label: 'Map', icon: Map, path: '/map' },
    { id: 'diagnose', label: 'Prediction', icon: Activity, path: '/diagnose' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
    { id: 'menu', label: 'Menu', icon: Menu, path: '/menu' }
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-brand-text/10 z-50 safe-area-bottom"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex justify-between items-center px-3 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-0.5 min-w-[3.5rem] py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-brand-accent' : 'text-brand-text-muted/60 hover:text-brand-text'
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-accent rounded-full" />
              )}
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold tracking-wide uppercase">
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
