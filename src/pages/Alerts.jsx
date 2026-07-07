import { useState, useEffect, useCallback } from 'react';
import { Bell, CloudRain, Thermometer, Bug, Wind, Plus, WifiOff, RefreshCw, CloudLightning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { fetchWeather, resolveLocation } from '../utils/weatherService';

/**
 * Generate real weather-driven alerts from live weather data.
 * Returns an array of alert objects.
 */
function buildWeatherAlerts(weather, farmName, cropName) {
  const alerts = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (!weather) return alerts;

  const { temp, rainProb, humidity, windSpeed, condition } = weather;

  // Thunderstorm — most urgent
  if (condition === 'Thunderstorm') {
    alerts.push({
      icon: CloudLightning,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      title: 'Thunderstorm Warning',
      message: `Active thunderstorm detected. Do NOT operate machinery or apply chemicals outdoors. Secure loose equipment on ${farmName || 'your farm'} immediately.`,
      time: `Updated at ${timeStr}`,
      urgent: true,
    });
  }

  // Heavy rain / precipitation
  if (condition === 'Rain' || rainProb > 2) {
    alerts.push({
      icon: CloudRain,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      title: 'Rain Advisory',
      message: `${rainProb > 2 ? `${rainProb}mm of rain` : 'Rainfall'} detected. Postpone pesticide and fertilizer application — runoff will reduce effectiveness and harm groundwater${cropName ? ` for your ${cropName} crop` : ''}.`,
      time: `Updated at ${timeStr}`,
      urgent: rainProb > 5,
    });
  }

  // Extreme heat
  if (temp !== null && temp > 35) {
    alerts.push({
      icon: Thermometer,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      title: `Heat Stress Alert — ${temp}°C`,
      message: `Extreme temperature can cause leaf scorch and boll drop${cropName ? ` in ${cropName}` : ''}. Schedule irrigation for early morning or late evening. Avoid spraying pesticides in direct sunlight.`,
      time: `Updated at ${timeStr}`,
      urgent: temp > 40,
    });
  }

  // High winds
  if (windSpeed !== null && windSpeed > 15) {
    alerts.push({
      icon: Wind,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
      title: `High Wind Alert — ${windSpeed} km/h`,
      message: `Wind speeds above 15 km/h cause pesticide drift to neighbouring farms and water bodies. Postpone all spray operations${cropName ? ` on your ${cropName} field` : ''}.`,
      time: `Updated at ${timeStr}`,
      urgent: windSpeed > 25,
    });
  }

  // High humidity — disease risk
  if (humidity !== null && humidity > 85) {
    alerts.push({
      icon: Bug,
      color: 'text-brand-danger',
      bg: 'bg-brand-danger/10',
      title: `High Humidity — Disease Risk (${humidity}%)`,
      message: `Humidity above 85% for extended periods creates ideal conditions for fungal diseases (rust, blight, mildew)${cropName ? ` in ${cropName}` : ''}. Inspect your crop and consider a preventive fungicide if conditions persist.`,
      time: `Updated at ${timeStr}`,
      urgent: humidity > 92,
    });
  }

  return alerts;
}

export default function Alerts() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  // Load farms from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fasal_farms');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFarms(parsed);
        if (parsed.length > 0) setSelectedFarmId(parsed[0].id);
      }
    } catch {}
  }, []);

  // Load real weather
  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const pos = await resolveLocation();
      const data = await fetchWeather(pos?.lat ?? null, pos?.lon ?? null);
      setWeather(data);
    } catch (err) {
      console.warn('[Alerts] Weather error:', err.message);
      setWeatherError('Could not load live weather for alerts.');
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => { loadWeather(); }, [loadWeather]);

  const activeFarm = farms.find(f => f.id === selectedFarmId);
  const alerts = buildWeatherAlerts(
    weather,
    activeFarm?.name,
    activeFarm?.crop
  );
  const urgentCount = alerts.filter(a => a.urgent).length;

  return (
    <div className="pt-6 px-5 pb-24 h-full flex-1 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-serif tracking-tight text-xl font-bold text-brand-text flex-1">
          Alerts & Advisories
        </h1>
        {!weatherLoading && (
          <button
            onClick={loadWeather}
            className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text transition-all"
          >
            <RefreshCw size={16} />
          </button>
        )}
        {urgentCount > 0 && (
          <span className="bg-brand-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {urgentCount} Urgent
          </span>
        )}
      </div>

      {/* Weather source notice */}
      {weather && !weatherLoading && (
        <div className="bg-brand-green/8 border border-brand-green/20 rounded-2xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-lg">🌡️</span>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            <span className="font-semibold text-brand-text">Live weather alerts</span> — based on real-time data.
            {weather.fromCache ? ' (Cached < 30 min)' : ''}
          </p>
        </div>
      )}

      {/* Farm selector (if multiple farms) */}
      {farms.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {farms.map(farm => (
            <button
              key={farm.id}
              onClick={() => setSelectedFarmId(farm.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFarmId === farm.id
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-white text-brand-text-muted hover:text-brand-text shadow-sm'
              }`}
            >
              {farm.name}
            </button>
          ))}
        </div>
      )}

      {/* No farms state */}
      {farms.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No Farms Yet"
          message="Add your first farm on the map to start receiving crop-specific alerts and weather warnings."
          action={
            <button onClick={() => navigate('/map')} className="primary-btn !w-auto !px-6">
              Add Your First Farm
            </button>
          }
        />
      ) : weatherLoading ? (
        /* Loading skeleton */
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl shadow-sm animate-pulse" />
          ))}
        </div>
      ) : weatherError ? (
        <div className="bg-white rounded-3xl border border-brand-text/5 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <WifiOff size={22} className="text-brand-text-muted" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-text">Cannot Load Alerts</p>
              <p className="text-xs text-brand-text-muted mt-0.5">{weatherError}</p>
            </div>
            <button
              onClick={loadWeather}
              className="flex items-center gap-1 text-xs text-brand-accent font-semibold bg-brand-green/10 px-3 py-2 rounded-xl hover:bg-brand-green/20 transition-colors flex-shrink-0"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-5">
            <Bell size={36} className="text-brand-accent" />
          </div>
          <h3 className="text-xl font-bold text-brand-text mb-2">All Clear ✅</h3>
          <p className="text-sm text-brand-text-muted max-w-[260px] leading-relaxed">
            No weather warnings for {activeFarm?.name || 'your farm'} right now.
            Current conditions are safe for field operations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeFarm && (
            <div className="card-flat px-4 py-2.5 mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-brand-text-muted">Showing alerts for</span>
              <span className="text-xs font-bold text-brand-text">
                {activeFarm.name} • {activeFarm.crop}
              </span>
            </div>
          )}
          {alerts.map((alert, idx) => {
            const Icon = alert.icon;
            return (
              <div
                key={idx}
                className={`card p-4 animate-fade-in-up ${alert.urgent ? 'border-l-4 border-l-brand-danger' : ''}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 ${alert.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={alert.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-brand-text">{alert.title}</h4>
                      <span className="text-[10px] text-brand-text-muted whitespace-nowrap mt-0.5">{alert.time}</span>
                    </div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
