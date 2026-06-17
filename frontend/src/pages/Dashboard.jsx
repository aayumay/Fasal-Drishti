import { useState, useEffect } from 'react';
import { CloudRain, Sun, TrendingUp, AlertTriangle, Cloud, MapPin, Droplets, Wind, Thermometer, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [locationName, setLocationName] = useState('Fetching location...');
  const [weatherData, setWeatherData] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('/api/market?commodity=Wheat');
        const data = await res.json();
        setMarketPrices(data || []);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      }
    };

    const fetchWeatherAndLocation = async (lat, lng) => {
      try {
        // 1. Reverse Geocoding via BigDataCloud
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const city = geoData.city || geoData.locality || 'Unknown Location';
        const state = geoData.principalSubdivision || geoData.countryName || '';
        setLocationName(`📍 ${city}${state ? `, ${state}` : ''}`);

        // 2. Weather from Backend using precise coordinates
        const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
        const weatherJson = await weatherRes.json();
        setWeatherData(weatherJson);
      } catch (err) {
        setError('Failed to fetch weather data.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleLocationError = (err) => {
      console.warn("Geolocation error or denied:", err.message);
      setLocationName("📍 Location Access Denied");
      setIsLoading(false);
      setError("Hardware GPS required for weather metrics.");
    };

    setIsLoading(true);
    fetchMarketData();

    // Native Geolocation API Call
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndLocation(position.coords.latitude, position.coords.longitude);
        },
        handleLocationError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      handleLocationError(new Error("Geolocation not supported by browser."));
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header with Location */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('welcome_back')}</h1>
          <div className="flex items-center text-slate-400 text-sm mt-1.5 gap-1.5">
            <span className="font-medium text-emerald-400">{locationName}</span>
          </div>
        </div>
      </div>

      {/* Weather Metrics */}
      <h2 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
        <Cloud size={20} /> {t('current_conditions')}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel p-5 flex flex-col items-center justify-center min-h-[110px] animate-pulse">
              <div className="h-6 w-6 bg-slate-700/50 rounded-full mb-3"></div>
              <div className="h-6 w-16 bg-slate-700/50 rounded mb-2"></div>
              <div className="h-3 w-12 bg-slate-700/50 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-center text-red-400 border border-red-500/20">
          <AlertTriangle size={24} className="mx-auto mb-2" />
          <p>{error}</p>
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
            <span className="text-2xl font-bold">{weatherData.humidity || 65}%</span>
            <span className="text-xs text-slate-400 mt-1">{t('humidity')}</span>
          </div>
          
          {/* Wind Speed */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-emerald-400/50 hover:bg-slate-800/80 transition-colors">
            <Wind size={24} className="text-emerald-400 mb-2" />
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{weatherData.windSpeed || 10}</span>
              <span className="text-xs font-semibold">km/h</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 truncate max-w-[100px]">{t('wind_speed')}</span>
          </div>
          
          {/* Rain Probability */}
          <div className="glass-panel p-4 flex flex-col items-center justify-center border-t-2 border-t-indigo-400/50 hover:bg-slate-800/80 transition-colors">
            <CloudRain size={24} className="text-indigo-400 mb-2" />
            <span className="text-2xl font-bold">{weatherData.rainProb}%</span>
            <span className="text-xs text-slate-400 mt-1">{t('rain_prob')}</span>
          </div>

          {/* Advisory */}
          <div className="col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm mt-2 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-400 mb-1 text-sm">{t('ai_advisory')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {weatherData.advisory}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Market Trends */}
      <div className="glass-panel p-6 mt-6">
        <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> {t('mandi_prices')}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="space-y-3">
            {marketPrices.map((item, idx) => (
              <div key={idx} className="flex flex-col bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-emerald-400">{item.crop}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{item.price}</span>
                    <span className={`text-xs px-2 py-1 rounded ${item.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : item.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{item.mandi}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
            {marketPrices.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-2">{t('no_market_data')}</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
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
