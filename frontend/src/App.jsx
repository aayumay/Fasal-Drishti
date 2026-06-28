import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { FarmProvider } from './context/FarmContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Splash from './pages/Splash';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import MapModule from './pages/MapModule';
import Diagnose from './pages/Diagnose';
import ActionPlan from './pages/ActionPlan';
import Alerts from './pages/Alerts';
import Menu from './pages/Menu';
import Settings from './pages/Settings';
import Help from './pages/Help';
import About from './pages/About';
import BottomNavigation from './components/BottomNavigation';
import LiveARScannerView from './pages/LiveARScannerView';

function AppLayout() {
  const location = useLocation();
  const isAuthScreen = ['/splash', '/login', '/profile-setup'].includes(location.pathname);
  const isScanner = location.pathname === '/scanner';
  
  // Do not apply layout padding or navbar to auth screens or full-screen scanner
  const noLayout = isAuthScreen || isScanner;

  return (
    <div className={`w-full h-screen overflow-hidden relative bg-brand-bg flex flex-col ${!noLayout ? 'pt-14 md:pl-64' : ''}`}>
      {!noLayout && <Navbar />}
      <BottomNavigation />
      
      {/* Centered Content Wrapper for Large Screens */}
      <div className={`flex flex-col flex-1 w-full ${!noLayout ? 'max-w-7xl mx-auto' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<MapModule />} />
        <Route path="/diagnose" element={<Diagnose />} />
        <Route path="/action-plan" element={<ActionPlan />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/scanner" element={<LiveARScannerView />} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
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
