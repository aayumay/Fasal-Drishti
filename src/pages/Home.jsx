import { useState, useEffect, useCallback } from 'react';
import {
  Wind, Droplets, CloudRain, ChevronRight, CloudSun, MapPin,
  Sprout, Plus, WifiOff, RefreshCw, Bell, Settings,
  Thermometer, Sun, Cloud, CloudLightning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WeatherSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFarmContext } from '../context/FarmContext';
import { useUserContext } from '../context/UserContext';
import { fetchWeather, resolveLocation, reverseGeocode } from '../utils/weatherService';

// Map weather condition to an icon + gradient color
function WeatherIcon({ condition, size = 40 }) {
  const props = { size, strokeWidth: 1.5 };
  if (condition === 'Rain')        return <CloudRain {...props} className="text-blue-400" />;
  if (condition === 'Thunderstorm') return <CloudLightning {...props} className="text-yellow-400" />;
  if (condition === 'Cloudy')      return <Cloud {...props} className="text-slate-400" />;
  return <Sun {...props} className="text-amber-400" />;
}

function weatherGradient(condition) {
  if (condition === 'Rain')        return 'from-blue-50 to-sky-100 border-blue-200';
  if (condition === 'Thunderstorm') return 'from-yellow-50 to-amber-100 border-amber-200';
  if (condition === 'Cloudy')      return 'from-slate-50 to-gray-100 border-gray-200';
  return 'from-amber-50 to-orange-50 border-orange-100';
}

const Home = () => {
  const navigate = useNavigate();
  const { myFarms } = useFarmContext();
  const { userName } = useUserContext();

  const [weather, setWeather]               = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError]     = useState('');
  const [filter, setFilter]                 = useState('All');
  const [userLocation, setUserLocation]     = useState('');
  const [hasAlerts, setHasAlerts]           = useState(false);

  const loadWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      // Resolve location first (GPS → IP geolocation)
      const pos = await resolveLocation();

      // Reverse geocode the location name in the background
      if (pos) {
        const fromIp = pos.source === 'ip' && pos.city;
        if (fromIp) {
          setUserLocation(`${pos.city}${pos.region ? `, ${pos.region}` : ''}`);
        } else if (pos.lat && pos.lon) {
          reverseGeocode(pos.lat, pos.lon)
            .then(name => { if (name) setUserLocation(name); })
            .catch(() => {});
        }
      }

      const wData = await fetchWeather(pos?.lat ?? null, pos?.lon ?? null);
      const mapped = {
        temp:       wData.temp,
        condition:  wData.condition,
        rainProb:   wData.rainProb,
        humidity:   wData.humidity,
        wind:       wData.windSpeed,
        advisory:   wData.advisory || '',
        fromCache:  wData.fromCache,
      };
      setWeather(mapped);

      // Show bell dot if there is a real weather warning
      const hasWarning = (wData.rainProb > 0) ||
        (wData.windSpeed > 15) ||
        (wData.temp > 35) ||
        wData.condition === 'Thunderstorm';
      setHasAlerts(hasWarning);

    } catch (err) {
      console.error('[Home] Weather error:', err.message);
      setWeatherError('Weather data unavailable. Check your connection.');
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => { loadWeatherData(); }, [loadWeatherData]);

  // Farm display data
  const displayFarms = myFarms.map(f => {
    let score = f.healthScore !== undefined && f.healthScore !== null ? f.healthScore : undefined;
    let color = 'bg-brand-text/50';
    if (score !== undefined) {
      if (score > 80) color = 'bg-brand-green';
      else if (score >= 50) color = 'bg-orange-400';
      else color = 'bg-brand-danger';
    }
    return {
      id:           f.id,
      name:         f.name || 'My Farm',
      size:         f.area_acres ? `${f.area_acres} Acres` : 'Unknown',
      crop:         f.crop || 'Unknown',
      scoreDisplay: score !== undefined ? `${score}%` : 'Evaluating...',
      location:     f.locationName || f.location || 'Unknown Location',
      status:       score !== undefined ? (score > 80 ? 'Healthy' : score >= 50 ? 'Watch' : 'High Risk') : 'Pending',
      color,
    };
  });

  return (
    <div className="pt-6 px-5 md:px-8 pb-6 h-full overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sprout size={20} className="text-brand-green" strokeWidth={1.5} />
            <h1 className="font-serif tracking-tight text-[22px] md:text-3xl font-bold text-brand-text">
              Hello, {userName || 'Farmer'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-brand-text-muted text-sm">
            <MapPin size={12} />
            <span>{userLocation || 'Detecting location…'}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {/* Bell — red dot only when there are real weather alerts */}
          <button
            onClick={() => navigate('/alerts')}
            className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all relative"
          >
            <Bell size={20} />
            {hasAlerts && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-danger rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* ── Weather Widget ── */}
      {weatherLoading ? (
        <WeatherSkeleton />
      ) : weather ? (
        <div className={`rounded-3xl border p-5 mb-6 bg-gradient-to-br ${weatherGradient(weather.condition)} animate-fade-in shadow-sm`}>
          {/* Top row — temp + icon */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[52px] font-bold text-brand-text leading-none tracking-tight">
                {weather.temp !== null ? `${weather.temp}°` : '—'}
              </div>
              <div className="text-sm font-semibold text-brand-text-muted mt-1">{weather.condition}</div>
              {weather.fromCache && (
                <div className="text-[10px] text-brand-text-muted mt-0.5">(Cached data)</div>
              )}
            </div>
            <div className="bg-white/70 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
              <WeatherIcon condition={weather.condition} size={36} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1">
              <Wind size={16} className="text-brand-text-muted" />
              <span className="text-sm font-bold text-brand-text">
                {weather.wind !== null ? `${weather.wind}` : '—'}
              </span>
              <span className="text-[10px] text-brand-text-muted font-medium leading-none">km/h Wind</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1">
              <Droplets size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-brand-text">
                {weather.humidity !== null ? `${weather.humidity}%` : '—'}
              </span>
              <span className="text-[10px] text-brand-text-muted font-medium leading-none">Humidity</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1">
              <CloudRain size={16} className="text-indigo-400" />
              <span className="text-sm font-bold text-brand-text">
                {weather.rainProb !== null ? `${weather.rainProb} mm` : '—'}
              </span>
              <span className="text-[10px] text-brand-text-muted font-medium leading-none">Rain</span>
            </div>
          </div>

          {/* Advisory */}
          {weather.advisory && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">🌾</span>
              <p className="text-xs font-medium text-brand-text leading-relaxed">{weather.advisory}</p>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={loadWeatherData}
            className="mt-3 flex items-center gap-1 text-[10px] text-brand-text-muted/70 hover:text-brand-text-muted transition-colors ml-auto"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>
      ) : weatherError ? (
        <div className="bg-white rounded-3xl border border-brand-text/5 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <WifiOff size={22} className="text-brand-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-brand-text">Weather Unavailable</p>
              <p className="text-xs text-brand-text-muted mt-0.5 leading-relaxed">{weatherError}</p>
            </div>
            <button
              onClick={loadWeatherData}
              className="flex items-center gap-1 text-xs text-brand-accent font-semibold bg-brand-green/10 px-3 py-2 rounded-xl hover:bg-brand-green/20 transition-colors flex-shrink-0"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Filters ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Fruit', 'Orchards', 'Grains'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              filter === cat
                ? 'bg-brand-green text-white shadow-sm'
                : 'bg-white text-brand-text-muted hover:text-brand-text shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── My Fields ── */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-brand-text">My Fields</h3>
        <button
          onClick={() => navigate('/map')}
          className="text-brand-text-muted text-sm font-semibold flex items-center hover:text-brand-accent transition-colors gap-0.5"
        >
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 pb-28 md:pb-8">
        {displayFarms.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No Fields Yet"
            message="No fields added. Go to the Map to register your first field."
            action={
              <button onClick={() => navigate('/map')} className="primary-btn !w-auto !px-6">
                Add Your First Field
              </button>
            }
          />
        ) : (
          displayFarms.map((farm, idx) => (
            <div
              key={farm.id}
              className="card overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99] animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => navigate('/map')}
            >
              <div className="p-5 pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-brand-green-light rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sprout size={22} className="text-brand-green" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-bold text-brand-text text-[16px] truncate">{farm.name}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                        farm.status === 'Healthy'   ? 'bg-brand-green-light text-brand-green' :
                        farm.status === 'Watch'     ? 'bg-orange-50 text-orange-500' :
                        farm.status === 'High Risk' ? 'bg-red-50 text-brand-danger' :
                                                      'bg-slate-100 text-brand-text-muted'
                      }`}>
                        {farm.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-text-muted text-[12px] mt-0.5">
                      <MapPin size={10} />
                      <span className="truncate">{farm.location}</span>
                      <span className="mx-1 flex-shrink-0">•</span>
                      <span className="flex-shrink-0">{farm.size}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-36 mx-3 mb-3 rounded-2xl overflow-hidden bg-brand-bg">
                <img src="/farm_background.png" alt={farm.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${farm.color}`} />
                    <span className="text-white text-xs font-bold drop-shadow-md">
                      Health: {farm.scoreDisplay}
                    </span>
                  </div>
                  <span className="text-white/80 text-[10px] font-medium bg-black/30 px-2 py-0.5 rounded-full">
                    {farm.crop}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
