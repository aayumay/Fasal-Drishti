import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <FarmProvider>
          <Router>
            <div className="max-w-7xl mx-auto w-full min-h-screen relative shadow-2xl overflow-hidden bg-brand-bg pt-14 md:pl-64 flex flex-col">
              <Navbar />
              <BottomNavigation />
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
          </Router>
        </FarmProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
