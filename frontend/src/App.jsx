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
            <div className="max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden bg-brand-bg pt-14">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/home" element={<div className="flex flex-col h-full"><Home /><BottomNavigation active="home" /></div>} />
          <Route path="/map" element={<div className="flex flex-col h-full"><MapModule /><BottomNavigation active="map" /></div>} />
          <Route path="/diagnose" element={<div className="flex flex-col h-full"><Diagnose /><BottomNavigation active="diagnose" /></div>} />
          <Route path="/action-plan" element={<div className="flex flex-col h-full"><ActionPlan /><BottomNavigation active="diagnose" /></div>} />
          <Route path="/alerts" element={<div className="flex flex-col h-full"><Alerts /><BottomNavigation active="alerts" /></div>} />
          <Route path="/menu" element={<div className="flex flex-col h-full"><Menu /><BottomNavigation active="menu" /></div>} />
          <Route path="/settings" element={<div className="flex flex-col h-full"><Settings /><BottomNavigation active="menu" /></div>} />
          <Route path="/help" element={<div className="flex flex-col h-full"><Help /><BottomNavigation active="menu" /></div>} />
          <Route path="/about" element={<div className="flex flex-col h-full"><About /><BottomNavigation active="menu" /></div>} />
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
