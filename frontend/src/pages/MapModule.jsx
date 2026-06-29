import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, useMapEvents, useMap, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, ChevronRight, Check, Plus, Minus, Navigation, Layers, MoreHorizontal, ShieldCheck, ArrowUpRight, X, MapPin, Trash2, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useFarmContext } from '../context/FarmContext';
import { polygon } from '@turf/helpers';
import area from '@turf/area';

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function MapInteractionHandler({ isDrawingMode, newPolygonCoords, setTempCoords }) {
  useMapEvents({
    click(e) {
      if (isDrawingMode && !newPolygonCoords) {
        setTempCoords(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    }
  });
  return null;
}

import { useLanguage } from '../context/LanguageContext';

export default function MapModule() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { myFarms: farms, activeFarm, setActiveFarmId, addFarm, removeFarm, updateFarmHealth } = useFarmContext();
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [newPolygonCoords, setNewPolygonCoords] = useState(null);
  const [tempCoords, setTempCoords] = useState([]);
  const [newFarmCrop, setNewFarmCrop] = useState('Soybean');
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const [mapCenter, setMapCenter] = useState(null);
  const [roiData, setRoiData] = useState(null);
  const [farmArea, setFarmArea] = useState(0);
  const [loadingSatellite, setLoadingSatellite] = useState(false);
  const [satelliteData, setSatelliteData] = useState(null);
  const [ndviTileUrl, setNdviTileUrl] = useState(null);

  const [healthyPct, setHealthyPct] = useState(0);
  const [watchPct, setWatchPct] = useState(0);
  const [highRiskPct, setHighRiskPct] = useState(0);
  const [criticalPct, setCriticalPct] = useState(100);
  const [farmScore, setFarmScore] = useState(0);
  const [lastSatelliteDate, setLastSatelliteDate] = useState(null); // ISO date string from AgroMonitoring
  const [isRealNdvi, setIsRealNdvi] = useState(false); // true only when AgroMonitoring data is confirmed

  // Math implementation for normal distribution
  const erf = (x) => {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741, a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  };

  useEffect(() => {
    // Farm state is now managed globally by FarmContext
    setLoading(false);
  }, [farms]);

  const [validationError, setValidationError] = useState(null);
  const [validating, setValidating] = useState(false);

  const handleSaveFarm = async () => {
    if (!newPolygonCoords || newPolygonCoords.length === 0) return;

    setValidating(true);
    setValidationError(null);

    let validation = null;
    try {
      const res = await fetch('/api/map/validate-farmland', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: newPolygonCoords,
          agro_api_key: import.meta.env.VITE_AGRO_API_KEY || ''
        })
      });
      if (res.ok) validation = await res.json();
    } catch (err) {
      console.warn("Farmland validation API offline:", err);
    }

    setValidating(false);

    // Block if explicitly detected as non-farmland
    if (validation && validation.is_farmland === false) {
      if (validation.classification === 'excessive_buildings') {
        setValidationError(
          `The selected area contains too many buildings (${validation.building_pct}% of the field). A valid agricultural field cannot have more than 10% building coverage. Please redraw your selection.`
        );
      } else {
        const label = validation.classification === 'urban_or_water'
          ? 'urban area, buildings, or water body'
          : 'bare soil or fallow land with no active crop';
        setValidationError(
          `This area appears to be a ${label} (NDVI: ${validation.ndvi_mean?.toFixed(2) ?? 'N/A'}). ` +
          `Please select an actual agricultural field.`
        );
      }
      return;
    }

    // Proceed to save
    let locationName = "Unknown Location";
    try {
      const lat = newPolygonCoords[0][0];
      const lng = newPolygonCoords[0][1];
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const city = geoData.city || geoData.locality || '';
        const state = geoData.principalSubdivision || geoData.countryName || '';
        locationName = [city, state].filter(Boolean).join(', ') || "Unknown Location";
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }

    const area_acres = validation?.area_acres || farmArea;
    const polygonId = validation?.polygon_id || null;
    const healthScore = validation?.health_score ?? null;

    // Apply real satellite metrics if available
    if (validation?.health_score != null) {
      setFarmScore(validation.health_score);
      setHealthyPct(validation.healthy_pct);
      setWatchPct(validation.watch_pct);
      setHighRiskPct(validation.high_risk_pct);
      setCriticalPct(validation.critical_pct);
    }

    const existingCropFarms = farms.filter(f => f.crop === newFarmCrop).length;
    const suffix = existingCropFarms > 0 ? ` ${existingCropFarms + 1}` : '';
    const farmName = `${newFarmCrop} Farm${suffix}`;

    const newFarm = {
      id: Date.now().toString(),
      name: farmName,
      crop: newFarmCrop,
      area_acres,
      coordinates: newPolygonCoords,
      locationName,
      polygonId,
      healthScore,
      classification: validation?.classification || 'unverified',
      ndvi_mean: validation?.ndvi_mean ?? null,
      status: 'Active'
    };

    addFarm(newFarm);
    setIsDrawingMode(false);
    setNewPolygonCoords(null);
    setTempCoords([]);
    setValidationError(null);
  };

  const handleDeleteFarm = () => {
    if (!activeFarm) return;
    if (window.confirm(`Are you sure you want to delete ${activeFarm.name}?`)) {
      removeFarm(activeFarm.id);
    }
  };

  const requestLocation = async (silent = false) => {
    if (!('geolocation' in navigator)) {
      if (!silent) setLocationDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationDenied(false);
      },
      (err) => { 
        console.error("GPS Denied:", err);
        if (!silent) setLocationDenied(true); 
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleUseCurrentLocation = () => requestLocation(false);

  const fetchSatelliteData = async (polyid, currentFarm) => {
    const applyFallback = () => {
      // Fallback: derive health from stored score (never fake random numbers)
      setSatelliteData(null);
      setIsRealNdvi(false);
      let fs = currentFarm?.healthScore != null ? currentFarm.healthScore : null;
      if (fs !== null) {
        setFarmScore(fs);
        setHealthyPct(fs);
        const rem = 100 - fs;
        setWatchPct(Math.floor(rem * 0.5));
        setHighRiskPct(Math.floor(rem * 0.3));
        setCriticalPct(rem - Math.floor(rem * 0.5) - Math.floor(rem * 0.3));
      }
    };

    try {
      setLoadingSatellite(true);
      // Fetch last 60 days so we always find the most recent satellite pass
      const end = Math.floor(Date.now() / 1000);
      const start = end - (60 * 24 * 60 * 60);
      const apiKey = import.meta.env.VITE_AGRO_API_KEY;

      const historyRes = await fetch(
        `https://api.agromonitoring.com/agro/1.0/ndvi/history?polyid=${polyid}&start=${start}&end=${end}&appid=${apiKey}`
      );
      if (historyRes.ok) {
        const history = await historyRes.json();
        if (history && history.length > 0) {
          // Sort descending – most recent satellite pass first
          history.sort((a, b) => b.dt - a.dt);
          const latest = history[0];

          // Store the satellite overpass date
          if (latest.dt) {
            setLastSatelliteDate(new Date(latest.dt * 1000).toISOString());
          }

          if (latest.tile?.ndvi) setNdviTileUrl(latest.tile.ndvi);

          if (latest.data) {
            setSatelliteData(latest.data);
            setIsRealNdvi(true);

            const mean = latest.data.mean;
            const std  = latest.data.std || 0.0001;
            const cdf  = (x) => 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));

            // NDVI thresholds → health zones
            const nCrit    = Math.max(0, Math.round(cdf(0.2) * 100));
            const nHigh    = Math.max(0, Math.round((cdf(0.4) - cdf(0.2)) * 100));
            const nWatch   = Math.max(0, Math.round((cdf(0.6) - cdf(0.4)) * 100));
            const nHealthy = Math.max(0, 100 - nCrit - nHigh - nWatch);
            const nScore   = Math.max(0, Math.round(mean * 100));

            setCriticalPct(nCrit);
            setHighRiskPct(nHigh);
            setWatchPct(nWatch);
            setHealthyPct(nHealthy);
            setFarmScore(nScore);
            if (currentFarm?.id && currentFarm.healthScore !== nScore) updateFarmHealth(currentFarm.id, nScore);
          }
        } else {
          console.warn('No satellite imagery yet for this polygon – using stored health score.');
          applyFallback();
        }
      } else {
        applyFallback();
      }
    } catch (e) {
      console.error('Satellite fetch failed:', e);
      applyFallback();
    } finally {
      setLoadingSatellite(false);
    }
  };

  useEffect(() => {
    if (activeFarm?.coordinates?.[0]) setMapCenter(activeFarm.coordinates[0]);
    if (!activeFarm) return;

    // Fetch ROI area data
    fetch('/api/map/ndvi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activeFarm.coordinates || [])
    }).then(r => r.json()).then(setRoiData).catch(console.error);

    // Initial satellite fetch
    if (activeFarm.polygonId) {
      fetchSatelliteData(activeFarm.polygonId, activeFarm);
    } else if (activeFarm.healthScore != null) {
      const fs = activeFarm.healthScore;
      setFarmScore(fs);
      setHealthyPct(fs);
      const rem = 100 - fs;
      setWatchPct(Math.floor(rem * 0.5));
      setHighRiskPct(Math.floor(rem * 0.3));
      setCriticalPct(rem - Math.floor(rem * 0.5) - Math.floor(rem * 0.3));
    }

    // ─── Auto-poll: check for new satellite passes every 30 minutes ───
    // Sentinel-2 revisit time is ~5 days. We poll frequently so the UI
    // updates the moment AgroMonitoring ingests new imagery.
    if (!activeFarm.polygonId) return;
    const POLL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
    const intervalId = setInterval(() => {
      console.log('[Fasal] Checking for new satellite data...');
      fetchSatelliteData(activeFarm.polygonId, activeFarm);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId); // cleanup on farm change
  }, [activeFarm?.id]);

  useEffect(() => { requestLocation(true); }, []);

  const generateGridCells = (coords, hPct, wPct, rPct) => {
    if (!coords || coords.length < 3) return [];
    
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    coords.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    const METERS_PER_DEGREE_LAT = 111111;
    const midLat = (minLat + maxLat) / 2;
    const METERS_PER_DEGREE_LNG = 111111 * Math.cos(midLat * Math.PI / 180);
    
    const stepLat = 10 / METERS_PER_DEGREE_LAT;
    const stepLng = 10 / METERS_PER_DEGREE_LNG;
    
    const validCells = [];
    
    const pointInPolygon = (point, vs) => {
      let x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    for (let lat = minLat; lat <= maxLat; lat += stepLat) {
      for (let lng = minLng; lng <= maxLng; lng += stepLng) {
        const cellMinLat = lat;
        const cellMaxLat = lat + stepLat;
        const cellMinLng = lng;
        const cellMaxLng = lng + stepLng;
        const centerLat = cellMinLat + stepLat / 2;
        const centerLng = cellMinLng + stepLng / 2;
        if (pointInPolygon([centerLat, centerLng], coords)) {
          validCells.push([ [cellMinLat, cellMinLng], [cellMaxLat, cellMaxLng] ]);
        }
      }
    }
    
    if (validCells.length === 0) return []; 
    
    const N = validCells.length;
    const watchCount = Math.round(N * wPct / 100);
    const riskCount = Math.round(N * rPct / 100);
    // criticalPct is derived from the remaining after healthy+watch+risk
    const cPct = Math.max(0, 100 - hPct - wPct - rPct);
    const critCount = Math.round(N * cPct / 100);

    const colors = [];
    for (let i = 0; i < N; i++) {
      if (i < watchCount) colors.push('#fbbf24');       // Watch  – amber
      else if (i < watchCount + riskCount) colors.push('#fb923c'); // High – orange
      else if (i < watchCount + riskCount + critCount) colors.push('#ef4444'); // Critical – red
      else colors.push('#22c55e'); // Healthy – green
    }

    // Deterministic shuffle so pattern is stable
    let seed = hPct * 100 + N;
    const random = () => { let x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [colors[i], colors[j]] = [colors[j], colors[i]];
    }

    return validCells.map((bounds, i) => ({
      bounds,
      color: colors[i]
    })).filter(cell => cell.color !== null);
  };


  // 1. Force area to be a valid number, default to 0
  const currentFarmArea = activeFarm ? activeFarm.area_acres : farmArea;
  const safeArea = parseFloat(currentFarmArea) || 0; 

  // 2. Base dose: 500ml per acre
  const fallbackStandardDose = Math.round(safeArea * 500) || 0; 
  const finalStandardDose = (roiData && typeof roiData.pesticide_volume_ml === 'number') ? roiData.pesticide_volume_ml : fallbackStandardDose;

  // 3. Calculate infected percentage (default to 0 if missing)
  const infectedPercentage = ((watchPct || 0) + (highRiskPct || 0) + (criticalPct || 0)) / 100;

  // 4. Calculate targeted dose
  const fallbackTargetedDose = Math.round(fallbackStandardDose * infectedPercentage) || 0;
  const finalTargetedDose = (roiData && typeof roiData.pesticide_volume_ml === 'number') ? Math.round(roiData.pesticide_volume_ml * (1 - ((roiData.savings_percent || 0)/100))) : fallbackTargetedDose;

  const finalSavingsPct = (roiData && typeof roiData.savings_percent === 'number') ? roiData.savings_percent : Math.round((1 - infectedPercentage) * 100) || 0;

  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const spreadDir = directions[farmScore % directions.length];
  const spreadDays = `${Math.max(1, Math.floor(farmScore / 20))} - ${Math.max(1, Math.floor(farmScore / 20)) + 2} Days`;
  const confidence = Math.min(99, farmScore + 8);

  return (
    <div className="pt-6 px-5 lg:px-8 pb-24 md:pb-8 flex flex-col flex-1 h-full overflow-y-auto" style={{ background: '#F8F6F2' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all" style={{ border: '1px solid rgba(35,66,41,0.08)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex flex-col items-center">
          {farms.length > 0 ? (
            <div className="relative inline-block">
              <select 
                value={activeFarm?.id || ""}
                onChange={(e) => {
                  const selected = farms.find(f => f.id === e.target.value);
                  if (selected) {
                    setActiveFarmId(selected.id);
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
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: '#1C2B1E' }}>{activeFarm?.name || t('no_farm_data')}</h1>
          )}
          {activeFarm && <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#7A8A7C' }}>{activeFarm.area_acres} {t('acres')} • {activeFarm.crop}</p>}
        </div>
        <button onClick={handleDeleteFarm} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-[#C0392B] hover:shadow-md transition-all" style={{ border: '1px solid rgba(35,66,41,0.08)' }}>
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-full gap-6">
        {/* Map Side */}
        <div className="relative w-full lg:w-2/3 h-[40vh] lg:h-[75vh] rounded-[32px] overflow-hidden shadow-sm flex-shrink-0" style={{ border: '1px solid rgba(35,66,41,0.08)' }}>
        {loadingSatellite && (
          <div className="absolute inset-0 z-[3000] bg-brand-bg/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-brand-text">Syncing Satellite Data...</span>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 z-[3000] bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-brand-text">Loading farms...</span>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-[9px] text-brand-text-muted text-center py-1.5 z-[2000] border-b border-brand-text/5 uppercase tracking-widest font-semibold">
          {satelliteData ? `Live NDVI • Sentinel-2 • ${lastSatelliteDate ? new Date(lastSatelliteDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent pass'}` : activeFarm?.polygonId ? 'Polling for latest satellite pass…' : 'Register farm to enable satellite analytics'}
        </div>

        {mapCenter ? (
          <MapContainer center={mapCenter} zoom={isDrawingMode ? 18 : 17} style={{ height: '100%', width: '100%' }} zoomControl={false} doubleClickZoom={false}>
            <RecenterMap center={mapCenter} />
            <TileLayer
              url={mapType === 'satellite' 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              attribution={mapType === 'satellite' ? "Tiles &copy; Esri" : "&copy; OpenStreetMap"}
            />

            <div className="absolute top-12 left-3 z-[1000] flex flex-col gap-2">
              <button 
                onClick={() => setMapType(prev => prev === 'satellite' ? 'street' : 'satellite')}
                className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-all ${mapType === 'street' ? 'bg-brand-green text-white' : 'bg-white text-brand-text hover:shadow-md'}`}
                title="Toggle Base Map"
              >
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
              <>
                <Polygon
                  positions={activeFarm.coordinates}
                  pathOptions={{ color: '#ffffff', weight: 2.5, fillOpacity: 0 }}
                />
                {/* Render risk grid whenever we have health data — real NDVI or stored score.
                    Healthy cells are always transparent so satellite imagery shows through. */}
                {(healthyPct + watchPct + highRiskPct + criticalPct > 0) &&
                  generateGridCells(activeFarm.coordinates, healthyPct, watchPct, highRiskPct).map((cell, idx) => (
                  <Rectangle
                    key={idx}
                    bounds={cell.bounds}
                    pathOptions={{ color: cell.color, weight: 0, fillColor: cell.color, fillOpacity: 0.55, stroke: false }}
                  />
                ))}
              </>
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

            <MapInteractionHandler isDrawingMode={isDrawingMode} newPolygonCoords={newPolygonCoords} setTempCoords={setTempCoords} />

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
        ) : (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-brand-bg">
            <div className="w-8 h-8 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mb-3"></div>
            <span className="text-sm font-semibold text-brand-text-muted">Awaiting GPS Lock...</span>
          </div>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-white/95 px-4 py-2.5 rounded-2xl shadow-sm text-[10px] font-semibold w-[90%] max-w-[320px] justify-between text-brand-text backdrop-blur-sm">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-green"></div> Healthy</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div> Watch</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> High Risk</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-danger"></div> Critical</span>
        </div>
      </div>

      {/* Information Drawer / Right Panel on Desktop, Bottom on Mobile */}
      <div className="lg:w-1/3 flex flex-col overflow-y-auto h-full pb-4 pr-1">

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
                <button onClick={() => { setTempCoords([]); setFarmArea(0); setValidationError(null); }} className="btn-sm">Clear</button>
                <button
                  onClick={() => {
                    setNewPolygonCoords(tempCoords);
                    setValidationError(null);
                    try {
                      const turfPoly = polygon([[...tempCoords.map(c => [c[1], c[0]]), [tempCoords[0][1], tempCoords[0][0]]]]);
                      const areaSqMeters = area(turfPoly);
                      const calculatedAcres = (areaSqMeters * 0.000247105).toFixed(2);
                      setFarmArea(parseFloat(calculatedAcres));
                    } catch(e) {
                      setFarmArea(0);
                    }
                  }}
                  disabled={tempCoords.length < 3}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${tempCoords.length >= 3 ? 'bg-brand-green text-white shadow-sm' : 'bg-brand-text/5 text-brand-text-muted/30'}`}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Validation error banner */}
              {validationError && (
                <div className="card p-4 border-l-4 border-l-[#C0392B] animate-fade-in bg-[#C0392B]/5 flex items-start gap-3">
                  <span className="text-[#C0392B] text-lg flex-shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-[#C0392B] mb-0.5">Not a Valid Agricultural Field</p>
                    <p className="text-xs text-brand-text-muted leading-relaxed">{validationError}</p>
                    <button
                      onClick={() => { setNewPolygonCoords(null); setTempCoords([]); setValidationError(null); setFarmArea(0); }}
                      className="mt-2 text-xs font-bold text-[#C0392B] underline"
                    >
                      Redraw Selection
                    </button>
                  </div>
                </div>
              )}
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
                <button
                  onClick={handleSaveFarm}
                  disabled={validating}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold bg-brand-green text-white shadow-sm transition-all hover:bg-brand-green/90 disabled:opacity-60"
                >
                  {validating ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                  ) : (
                    <><Check size={14} /> Validate & Save</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeFarm ? (
        <>
          {/* Farm Overview Card */}
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-brand-text">Farm Overview</h3>
              <div className="flex items-center gap-2">
                {isRealNdvi ? (
                  <span className="text-[9px] font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck size={9} /> LIVE NDVI
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-brand-text-muted bg-brand-text/5 px-2 py-1 rounded-lg">
                    STORED DATA
                  </span>
                )}
                {activeFarm?.polygonId && (
                  <button
                    onClick={() => fetchSatelliteData(activeFarm.polygonId, activeFarm)}
                    title="Refresh satellite data"
                    className="w-7 h-7 rounded-lg bg-[#F8F6F2] flex items-center justify-center text-brand-text-muted hover:text-brand-green hover:bg-brand-green/10 transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                  </button>
                )}
              </div>
            </div>

            {lastSatelliteDate && (
              <p className="text-[10px] text-brand-text-muted mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Last satellite pass: <strong>{new Date(lastSatelliteDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong> • Next: ~{(() => { const d = new Date(lastSatelliteDate); d.setDate(d.getDate() + 5); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); })()}
              </p>
            )}

            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F5F0E8" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#D4A373" strokeWidth="4" strokeDasharray={`${farmScore} ${100 - farmScore}`} strokeLinecap={farmScore > 0 ? "round" : "butt"} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-brand-text leading-none">{farmScore}%</span>
                  <span className="text-[10px] text-brand-text-muted mt-1 font-medium">Health</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2.5 text-xs font-medium">
                {[
                  { label: 'Healthy', val: healthyPct, color: 'bg-brand-green' },
                  { label: 'Watch', val: watchPct, color: 'bg-brand-accent' },
                  { label: 'High Risk', val: highRiskPct, color: 'bg-orange-400' },
                  { label: 'Critical', val: criticalPct, color: 'bg-brand-danger' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${color}`} /><span className="text-brand-text-muted">{label}</span></span>
                    <span className="text-brand-text font-bold">{val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predicted Spread & Confidence Card */}
          <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] text-brand-text-muted font-medium mb-1.5">Predicted Spread</p>
                <p className="text-brand-text font-bold text-base flex items-center gap-1.5 mb-1">
                  {spreadDir} <ArrowUpRight size={16} className="text-brand-accent" />
                </p>
                <p className="text-[12px] text-brand-text-muted">{spreadDays}</p>
              </div>
              <div className="w-px h-12 bg-brand-text/10"></div>
              <div className="flex-1">
                <p className="text-[11px] text-brand-text-muted font-medium mb-1.5">Confidence</p>
                <p className="text-brand-text font-bold text-xl">{confidence}%</p>
                <div className="flex items-center gap-1 mt-1 text-brand-green">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-semibold">AI Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pesticide ROI Dashboard */}
          {activeFarm && (
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-3xl p-6 mb-5 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <IndianRupee size={16} className="text-brand-green" />
                  </div>
                  <h3 className="text-sm font-bold text-brand-text">Precision ROI</h3>
                </div>
                <span className="text-xs font-bold text-brand-green px-2 py-1 bg-brand-green/10 rounded-lg">
                  {finalSavingsPct}% Savings
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col justify-center items-start p-4 rounded-xl bg-white shadow-sm w-full relative overflow-hidden border border-brand-text/5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Standard Spray</div>
                  <div className="flex flex-row items-baseline gap-1 relative z-10">
                    <div className="text-3xl font-extrabold text-gray-900">{finalStandardDose}</div>
                    <div className="text-sm font-medium text-gray-500">ml</div>
                  </div>
                  <div className="absolute right-0 bottom-0 w-16 h-16 bg-brand-danger/5 rounded-tl-[40px]"></div>
                </div>
                
                <div className="flex flex-col justify-center items-start p-4 rounded-xl bg-white shadow-sm w-full relative overflow-hidden border border-brand-text/5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Targeted Spray</div>
                  <div className="flex flex-row items-baseline gap-1 relative z-10">
                    <div className="text-3xl font-extrabold text-gray-900">{finalTargetedDose}</div>
                    <div className="text-sm font-medium text-gray-500">ml</div>
                  </div>
                  <div className="absolute right-0 bottom-0 w-16 h-16 bg-brand-green/10 rounded-tl-[40px]"></div>
                </div>
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}
