import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, ChevronRight, Check, Plus, Minus, Navigation, Layers, MoreHorizontal, ShieldCheck, ArrowUpRight, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function MapModule() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [newPolygonCoords, setNewPolygonCoords] = useState(null);
  const [tempCoords, setTempCoords] = useState([]);
  const [newFarmCrop, setNewFarmCrop] = useState('Soybean');
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.7045, 77.1028]);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const localFarms = localStorage.getItem('fasal_farms');
        if (localFarms) {
          const parsed = JSON.parse(localFarms);
          setFarms(parsed);
          const activeId = localStorage.getItem('fasal_active_farm_id');
          if (activeId) {
            const found = parsed.find(f => f.id === activeId);
            if (found) {
              setActiveFarm(found);
            } else if (parsed.length > 0) {
              setActiveFarm(parsed[0]);
              localStorage.setItem('fasal_active_farm_id', parsed[0].id);
            }
          } else if (parsed.length > 0) {
            setActiveFarm(parsed[0]);
            localStorage.setItem('fasal_active_farm_id', parsed[0].id);
          }
          setLoading(false);
          return;
        }
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : 'mock-token';
        const res = await fetch('http://localhost:8000/api/farms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
          if (data.length > 0) {
            setActiveFarm(data[0]);
            localStorage.setItem('fasal_active_farm_id', data[0].id);
          }
          localStorage.setItem('fasal_farms', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch farms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const handleSaveFarm = async () => {
    if (!newPolygonCoords) return;
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : 'mock-token';
      const payload = {
        name: `Farm ${String.fromCharCode(65 + farms.length)}`,
        crop: newFarmCrop,
        area_acres: 2.5,
        coordinates: newPolygonCoords,
        score: Math.floor(Math.random() * 40) + 60,
        status: 'Watch',
        color: 'bg-brand-accent'
      };
      let newId = Date.now().toString();
      try {
        const res = await fetch('http://localhost:8000/api/farms', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          newId = data.farm_id;
        }
      } catch (err) {
        console.warn("Backend offline, saving to localStorage only.");
      }

      const newFarm = { id: newId, ...payload };
      const updatedFarms = [...farms, newFarm];
      setFarms(updatedFarms);
      setActiveFarm(newFarm);
      localStorage.setItem('fasal_farms', JSON.stringify(updatedFarms));
      localStorage.setItem('fasal_active_farm_id', newId);
      setIsDrawingMode(false);
      setNewPolygonCoords(null);
      setTempCoords([]);
    } catch (err) {
      console.error("Error saving farm:", err);
    }
  };

  const handleDeleteFarm = () => {
    if (!activeFarm) return;
    if (window.confirm(`Are you sure you want to delete ${activeFarm.name}?`)) {
      const updatedFarms = farms.filter(f => f.id !== activeFarm.id);
      setFarms(updatedFarms);
      localStorage.setItem('fasal_farms', JSON.stringify(updatedFarms));
      if (updatedFarms.length > 0) {
        setActiveFarm(updatedFarms[0]);
        localStorage.setItem('fasal_active_farm_id', updatedFarms[0].id);
      } else {
        setActiveFarm(null);
        localStorage.removeItem('fasal_active_farm_id');
      }
    }
  };

  function MapInteractionHandler() {
    useMapEvents({
      click(e) {
        if (isDrawingMode && !newPolygonCoords) {
          setTempCoords(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
        }
      }
    });
    return null;
  }

  const requestLocation = async (silent = false) => {
    const fallbackToIp = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          setMapCenter([data.latitude, data.longitude]);
          setUserLocation([data.latitude, data.longitude]);
          setLocationDenied(false);
          return true;
        }
      } catch {}
      return false;
    };
    if (!('geolocation' in navigator) || (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')) {
      const success = await fallbackToIp();
      if (!success && !silent) setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationDenied(false);
      },async () => { const success = await fallbackToIp(); if (!success && !silent) setLocationDenied(true); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleUseCurrentLocation = () => requestLocation(false);

  function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
    return null;
  }

  useEffect(() => {
    if (activeFarm?.coordinates?.[0]) {
      setMapCenter(activeFarm.coordinates[0]);
    }
  }, [activeFarm]);

  useEffect(() => { requestLocation(true); }, []);

  const farmScore = activeFarm?.score || 82;

  return (
    <div className="pt-12 px-5 pb-24 flex flex-col flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex flex-col items-center">
          {farms.length > 1 ? (
            <div className="relative inline-block">
              <select 
                value={activeFarm?.id || ""}
                onChange={(e) => {
                  const selected = farms.find(f => f.id === e.target.value);
                  if (selected) {
                    setActiveFarm(selected);
                    localStorage.setItem('fasal_active_farm_id', selected.id);
                  }
                }}
                className="text-lg font-bold text-brand-text bg-transparent outline-none appearance-none cursor-pointer pr-4 text-center"
                style={{ textAlignLast: 'center' }}
              >
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          ) : (
            <h1 className="text-lg font-bold text-brand-text">{activeFarm?.name || "No Farm"}</h1>
          )}
          {activeFarm && <p className="text-brand-text-muted text-xs">{activeFarm.area_acres} Acre • {activeFarm.crop}</p>}
        </div>
        <button className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Location Permission Prompt */}
      {locationDenied && (
        <div className="mb-4 card p-4 border-l-4 border-l-brand-accent animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={15} className="text-brand-accent" />
                <h4 className="text-sm font-bold text-brand-text">Location Access</h4>
              </div>
              <p className="text-xs text-brand-text-muted leading-relaxed mb-3">
                Enable location to center the map on your current position.
              </p>
              <button
                onClick={() => requestLocation(false)}
                className="bg-brand-accent text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-accent-hover transition-colors"
              >
                Try Again
              </button>
            </div>
            <button onClick={() => setLocationDenied(false)} className="text-brand-text-muted hover:text-brand-text p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Top Actions for Drawing */}
      {isDrawingMode && (
        <div className="flex flex-col gap-2 mb-4 animate-fade-in">
          {!newPolygonCoords ? (
            <div className="card flex justify-between items-center px-4 py-3">
              <span className="font-medium text-brand-text-muted text-sm">Tap map to draw corners ({tempCoords.length})</span>
              <div className="flex gap-2">
                <button onClick={() => setTempCoords([])} className="btn-sm">Clear</button>
                <button
                  onClick={() => setNewPolygonCoords(tempCoords)}
                  disabled={tempCoords.length < 3}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${tempCoords.length >= 3 ? 'bg-brand-green text-white shadow-sm' : 'bg-brand-text/5 text-brand-text-muted/30'}`}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex justify-between items-center px-4 py-3 gap-2">
              <select
                value={newFarmCrop}
                onChange={(e) => setNewFarmCrop(e.target.value)}
                className="flex-1 bg-brand-bg text-brand-text text-sm px-3 py-2 rounded-xl outline-none border border-brand-text/10"
              >
                <option value="Soybean">Soybean</option>
                <option value="Cotton">Cotton</option>
                <option value="Rice">Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Tomato">Tomato</option>
              </select>
              <button onClick={handleSaveFarm} className="flex items-center gap-1 text-xs px-4 py-2 rounded-xl font-bold bg-brand-green text-white shadow-sm transition-all hover:bg-brand-green/90">
                <Check size={14} /> Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm mb-5 bg-brand-bg">
        {loading && (
          <div className="absolute inset-0 z-[3000] bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-brand-text">Loading farms...</span>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-[9px] text-brand-text-muted text-center py-1.5 z-[2000] border-b border-brand-text/5 uppercase tracking-widest font-semibold">
          Data Source: Sentinel-2 Based Model Simulation for MVP
        </div>

        <MapContainer center={mapCenter} zoom={isDrawingMode ? 18 : 17} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <RecenterMap center={mapCenter} />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />

          <div className="absolute top-12 left-3 z-[1000] flex flex-col gap-2">
            <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-text hover:shadow-md transition-all">
              <Layers size={18} />
            </button>
            <div className="bg-white rounded-xl shadow-sm flex flex-col overflow-hidden text-brand-text">
              <button
                onClick={() => { setIsDrawingMode(!isDrawingMode); setNewPolygonCoords(null); setTempCoords([]); }}
                className={`w-10 h-10 flex items-center justify-center transition-colors border-b border-brand-text/10 ${isDrawingMode ? 'bg-brand-green text-white' : 'hover:bg-brand-bg'}`}
              >
                <Plus size={18} />
              </button>
              <button
                onClick={() => { if (tempCoords.length > 0) setTempCoords(prev => prev.slice(0, -1)); }}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-bg transition-colors"
              >
                <Minus size={18} />
              </button>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); handleUseCurrentLocation(); }}
              className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-text hover:shadow-md transition-all"
            >
              <Navigation size={18} />
            </button>
          </div>

          {activeFarm?.coordinates && !isDrawingMode && (
            <Polygon
              positions={activeFarm.coordinates}
              pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#E07A5F', fillOpacity: 0.5 }}
            />
          )}

          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={L.divIcon({
                className: 'custom-user-location-marker',
                html: `<div class="relative flex h-5 w-5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-5 w-5 border-2 border-white bg-blue-500 shadow-md"></span></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })} 
            />
          )}

          <MapInteractionHandler />

          {isDrawingMode && !newPolygonCoords && tempCoords.length > 0 && (
            <>
              {tempCoords.length > 1 && (
                <Polyline positions={tempCoords} pathOptions={{ color: '#4ade80', weight: 3, dashArray: '5, 10' }} />
              )}
              {tempCoords.map((coord, idx) => (
                <Marker
                  key={idx}
                  position={coord}
                  icon={L.divIcon({ className: 'bg-[#4ade80] w-3 h-3 rounded-full border-2 border-white', iconSize: [12, 12], iconAnchor: [6, 6] })}
                />
              ))}
            </>
          )}

          {newPolygonCoords && (
            <Polygon
              positions={newPolygonCoords}
              pathOptions={{ color: '#4ade80', weight: 2, fillColor: '#4ade80', fillOpacity: 0.3 }}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm text-[10px] font-semibold w-[90%] max-w-[320px] justify-between text-brand-text backdrop-blur-sm">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div> Healthy</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div> Watch</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> High Risk</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-danger"></div> Critical</span>
        </div>
      </div>

      {activeFarm ? (
        <>
          {/* Farm Overview Card */}
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
            <h3 className="text-base font-bold text-brand-text mb-5">Farm Overview</h3>
            
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F5F0E8" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#D4A373" strokeWidth="4" strokeDasharray={`${activeFarm.score || 82} ${100 - (activeFarm.score || 82)}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-brand-text leading-none">{activeFarm.score || 82}%</span>
                  <span className="text-[10px] text-brand-text-muted mt-1 font-medium">Health</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-2.5 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div><span className="text-brand-text-muted">Healthy</span></span>
                  <span className="text-brand-text font-bold">62%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div><span className="text-brand-text-muted">Watch</span></span>
                  <span className="text-brand-text font-bold">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div><span className="text-brand-text-muted">High Risk</span></span>
                  <span className="text-brand-text font-bold">14%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-brand-danger"></div><span className="text-brand-text-muted">Critical</span></span>
                  <span className="text-brand-text font-bold">6%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predicted Spread & Confidence Card */}
          <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-brand-text-muted font-medium mb-1.5">Predicted Spread</p>
                <p className="text-brand-text font-bold text-base flex items-center gap-1.5 mb-1">
                  North-East <ArrowUpRight size={16} className="text-brand-accent" />
                </p>
                <p className="text-[12px] text-brand-text-muted">3 - 5 Days</p>
              </div>
              <div className="w-px h-12 bg-brand-text/10"></div>
              <div className="flex-1">
                <p className="text-[11px] text-brand-text-muted font-medium mb-1.5">Confidence</p>
                <p className="text-brand-text font-bold text-xl">89%</p>
                <div className="flex items-center gap-1 mt-1 text-brand-green">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-semibold">AI Verified</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/diagnose')} className="primary-btn">
            <span>View Prediction</span>
            <ChevronRight size={20} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-8 mb-4 shadow-sm text-center border border-dashed border-brand-green/30">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
            <Layers size={24} className="text-brand-green" />
          </div>
          <h3 className="text-base font-bold text-brand-text mb-2">No Farm Selected</h3>
          <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">
            Please tap the + button on the map to draw your farm boundary and unlock AI Sentinel analytics.
          </p>
          <button 
            onClick={() => setIsDrawingMode(true)}
            className="bg-brand-green/10 text-brand-green font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-brand-green/20 transition-colors"
          >
            Draw New Farm
          </button>
        </div>
      )}
    </div>
  );
}
