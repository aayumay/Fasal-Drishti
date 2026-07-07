import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { FarmProvider } from './context/FarmContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';

// ── Core (always bundled — tiny files) ──
import Splash       from './pages/Splash';
import Login        from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';

// ── Lazy-loaded pages (code-split → faster initial load) ──
const Home           = lazy(() => import('./pages/Home'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const MapModule      = lazy(() => import('./pages/MapModule'));
const Diagnose       = lazy(() => import('./pages/Diagnose'));
const ActionPlan     = lazy(() => import('./pages/ActionPlan'));
const Alerts         = lazy(() => import('./pages/Alerts'));
const Menu           = lazy(() => import('./pages/Menu'));
const Settings       = lazy(() => import('./pages/Settings'));
const Help           = lazy(() => import('./pages/Help'));
const About          = lazy(() => import('./pages/About'));
const LiveARScannerView = lazy(() => import('./pages/LiveARScannerView'));

/** Minimal full-screen loading fallback while a lazy chunk downloads */
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-brand-text-muted text-xs">Loading…</span>
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAuthScreen = ['/splash', '/login', '/profile-setup'].includes(location.pathname);
  const isScanner    = location.pathname === '/scanner';
  const noLayout     = isAuthScreen || isScanner;

  return (
    <div className={`w-full h-screen overflow-hidden relative bg-brand-bg flex flex-col ${!noLayout ? 'pt-14 md:pl-64' : ''}`}>
      {!noLayout && <Navbar />}
      <BottomNavigation />

      <div className={`flex flex-col flex-1 w-full overflow-hidden ${!noLayout ? 'max-w-7xl mx-auto' : ''}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"              element={<Navigate to="/splash" replace />} />
            <Route path="/splash"        element={<Splash />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/home"          element={<Home />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/map"           element={<MapModule />} />
            <Route path="/diagnose"      element={<Diagnose />} />
            <Route path="/action-plan"   element={<ActionPlan />} />
            <Route path="/alerts"        element={<Alerts />} />
            <Route path="/menu"          element={<Menu />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/help"          element={<Help />} />
            <Route path="/about"         element={<About />} />
            <Route path="/scanner"       element={<LiveARScannerView />} />
            <Route path="*"             element={<Navigate to="/splash" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <FarmProvider>
          <Router>
            <AppLayout />
          </Router>
        </FarmProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
