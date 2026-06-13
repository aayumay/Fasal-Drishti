import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Map as MapIcon, LogOut } from 'lucide-react';

export default function Navbar() {
  return (
    <>
      {/* Top Navbar for Desktop */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 glass-panel m-4 sticky top-4 z-50">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-2xl tracking-wide">
          <span className="text-3xl">🌱</span> FasalDrishti
        </div>
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "text-emerald-400" : "text-slate-300 hover:text-white transition-colors"}>Dashboard</NavLink>
          <NavLink to="/diagnose" className={({isActive}) => isActive ? "text-emerald-400" : "text-slate-300 hover:text-white transition-colors"}>Diagnose</NavLink>
          <NavLink to="/map" className={({isActive}) => isActive ? "text-emerald-400" : "text-slate-300 hover:text-white transition-colors"}>Farm Map</NavLink>
          <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors ml-4">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
         <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl tracking-wide">
          <span className="text-2xl">🌱</span> FasalDrishti
        </div>
        <button className="text-slate-400 p-2">
           <LogOut size={20} />
        </button>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel !rounded-none !rounded-t-2xl z-50 px-6 py-3 flex justify-between items-center pb-safe">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/diagnose" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
          {({ isActive }) => (
            <>
              <div className={`p-3 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'} -mt-6 border-4 border-slate-900 shadow-xl`}>
                 <ScanLine size={28} />
              </div>
              <span className="text-[10px] font-medium mt-1">Scan</span>
            </>
          )}
        </NavLink>
        <NavLink to="/map" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
          <MapIcon size={24} />
          <span className="text-[10px] font-medium">Map</span>
        </NavLink>
      </nav>
    </>
  );
}
