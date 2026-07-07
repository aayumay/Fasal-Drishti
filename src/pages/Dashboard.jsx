import { useState, useEffect, useCallback } from 'react';
import {
  CloudRain, TrendingUp, AlertTriangle, Cloud,
  Droplets, Wind, Thermometer, RefreshCw, WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { fetchWeather, resolveLocation, reverseGeocode } from '../utils/weatherService';

export default function Dashboard() {
  const { t } = useLanguage();

  // Location
  const [locationName, setLocationName] = useState('Detecting location…');

  // Weather
  const [weatherData, setWeatherData]   = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError]   = useState('');
  const [isFromCache, setIsFromCache]     = useState(false);

  // Market
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError]   = useState('');

  // --- Weather loader (with retry) ---
  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError('');
    setIsFromCache(false);
    try {
      const pos = await resolveLocation();
      const lat = pos?.lat ?? null;
      const lon = pos?.lon ?? null;

      if (lat && lon) {
        // If IP-based, we already have city name
        if (pos.source === 'ip' && pos.city) {
          setLocationName(`📍 ${pos.city}${pos.region ? `, ${pos.region}` : ''}`);
        } else {
          reverseGeocode(lat, lon).then(name => {
            setLocationName(name ? `📍 ${name}` : '📍 Location detected');
          });
        }
      } else {
        setLocationName('📍 Location unavailable');
      }

      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
      if (data.fromCache) setIsFromCache(true);
    } catch (err) {
      console.error('[Dashboard] Weather error:', err.message);
      setWeatherError('Could not load weather data. Check your connection.');
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // --- Market loader ---
  const loadMarket = useCallback(async () => {
    setMarketLoading(true);
    setMarketError('');
    try {
      const res = await fetch('/api/market?commodity=Wheat', {
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');
      setMarketPrices(data);
    } catch (err) {
      console.warn('[Dashboard] Market error:', err.message);
      setMarketError('Market prices unavailable right now.');
      setMarketPrices([]);
    } finally {
      setMarketLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    loadMarket();
  }, [loadWeather, loadMarket]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif tracking-tight text-2xl font-bold">{t('welcome_back')}</h1>
          <span className="font-medium text-emerald-400 text-sm mt-1 block">{locationName}</span>
        </div>
      </div>

      {/* ── Weather section ── */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif tracking-tight text-lg font-semibold text-emerald-400 flex items-center gap-2">
          <Cloud size={20} /> {t('current_conditions')}
          {isFromCache && (
            <span className="text-[10px] font-normal text-slate-500 ml-1">(cached)</span>
          )}
        </h2>
        {!weatherLoading && (
          <button
            onClick={loadWeather}
            title="Refresh weather"
            className="text-slate-400 hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-slate-800/50"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {weatherLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel p-5 flex flex-col items-center justify-center min-h-[110px] animate-pulse">
              <div className="h-6 w-6 bg-slate-700/50 rounded-full mb-3" />
              <div className="h-6 w-16 bg-slate-700/50 rounded mb-2" />
              <div className="h-3 w-12 bg-slate-700/50 rounded" />
            </div>
          ))}
        </div>
      ) : weatherError ? (
        <div className="glass-panel p-6 text-center border border-red-500/20">
          <WifiOff size={28} className="mx-auto mb-3 text-red-400" />
          <p className="text-red-400 text-sm mb-1">Weather Unavailable</p>
          <p className="text-slate-500 text-xs mb-4">{weatherError}</p>
          <button
            onClick={loadWeather}
            className="flex items-center gap-1.5 mx-auto text-xs text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
          >
            <RefreshCw size={12} /> Try Again
          </button>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-amber-400/50 hover:bg-slate-800/80 transition-colors">
            <Thermometer size={24} className="text-amber-400 mb-2" />
            <span className="text-2xl font-bold">{weatherData.temp}°C</span>
            <span className="text-xs text-slate-400 mt-1">{t('temperature')}</span>
          </div>

          {/* Humidity */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-blue-400/50 hover:bg-slate-800/80 transition-colors">
            <Droplets size={24} className="text-blue-400 mb-2" />
            <span className="text-2xl font-bold">
              {weatherData.humidity !== null && weatherData.humidity !== undefined
                ? `${weatherData.humidity}%`
                : '—'}
            </span>
            <span className="text-xs text-slate-400 mt-1">{t('humidity')}</span>
          </div>

          {/* Wind Speed */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-emerald-400/50 hover:bg-slate-800/80 transition-colors">
            <Wind size={24} className="text-emerald-400 mb-2" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {weatherData.windSpeed !== null && weatherData.windSpeed !== undefined
                  ? weatherData.windSpeed
                  : '—'}
              </span>
              {weatherData.windSpeed !== null && <span className="text-xs font-semibold">km/h</span>}
            </div>
            <span className="text-xs text-slate-400 mt-1">{t('wind_speed')}</span>
          </div>

          {/* Rain / Precipitation */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-indigo-400/50 hover:bg-slate-800/80 transition-colors">
            <CloudRain size={24} className="text-indigo-400 mb-2" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {weatherData.rainProb !== null && weatherData.rainProb !== undefined
                  ? weatherData.rainProb
                  : '—'}
              </span>
              {weatherData.rainProb !== null && <span className="text-xs font-semibold">mm</span>}
            </div>
            <span className="text-xs text-slate-400 mt-1">{t('rain_prob')}</span>
          </div>

          {/* AI Advisory */}
          {weatherData.advisory && (
            <div className="col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-400 mb-1 text-sm">{t('ai_advisory')}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{weatherData.advisory}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Market Trends ── */}
      <div className="glass-panel p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif tracking-tight text-lg font-semibold text-emerald-400 flex items-center gap-2">
            <TrendingUp size={20} /> {t('mandi_prices')}
          </h2>
          {!marketLoading && (
            <button
              onClick={loadMarket}
              title="Refresh market"
              className="text-slate-400 hover:text-emerald-400 transition-colors p-1 rounded-lg hover:bg-slate-800/50"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        {marketLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : marketError ? (
          <div className="text-center py-4">
            <WifiOff size={22} className="mx-auto mb-2 text-slate-500" />
            <p className="text-sm text-slate-400 mb-3">{marketError}</p>
            <button
              onClick={loadMarket}
              className="flex items-center gap-1.5 mx-auto text-xs text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : marketPrices.length > 0 ? (
          <div className="space-y-3">
            {marketPrices.map((item, idx) => (
              <div key={idx} className="flex flex-col bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-emerald-400">{item.crop}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{item.price}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.trend === 'up'   ? 'bg-emerald-500/20 text-emerald-400' :
                      item.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                              'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '—'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{item.mandi}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-2">{t('no_market_data')}</p>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/diagnose" className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/80 transition-colors group">
          <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-400 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📷</span>
          </div>
          <span className="font-medium">{t('scan_leaf')}</span>
        </Link>
        <Link to="/map" className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/80 transition-colors group">
          <div className="bg-blue-500/20 p-4 rounded-full text-blue-400 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🗺️</span>
          </div>
          <span className="font-medium">{t('farm_map')}</span>
        </Link>
      </div>

    </div>
  );
}
