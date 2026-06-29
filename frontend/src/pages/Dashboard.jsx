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
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const city = geoData.city || geoData.locality || 'Unknown Location';
        const state = geoData.principalSubdivision || geoData.countryName || '';
        setLocationName(`📍 ${city}${state ? `, ${state}` : ''}`);

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
    <div className="pt-6 px-5 lg:px-8 pb-24 h-full overflow-y-auto" style={{ background: '#F8F6F2' }}>
      {/* Header with Location */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '24px', color: '#1C2B1E', letterSpacing: '-0.02em' }}>
            {t('welcome_back')}
          </h1>
          <div className="flex items-center mt-1.5 gap-1.5" style={{ color: '#7A8A7C', fontFamily: 'Manrope, sans-serif', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: '#2F5D3A' }}>{locationName}</span>
          </div>
        </div>
      </div>

      {/* Weather Metrics */}
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: '#1C2B1E', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cloud size={20} style={{ color: '#2F5D3A' }} /> {t('current_conditions')}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 flex flex-col items-center justify-center min-h-[110px] animate-shimmer"></div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-6 text-center border-l-4" style={{ borderLeftColor: '#C0392B' }}>
          <AlertTriangle size={24} className="mx-auto mb-2 text-[#C0392B]" />
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: '#C0392B', fontWeight: 600 }}>{error}</p>
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="card p-4 flex flex-col items-center justify-center">
            <Thermometer size={24} style={{ color: '#D9C27A', marginBottom: '8px' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1C2B1E' }}>{weatherData.temp}°C</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '11px', fontWeight: 600, color: '#7A8A7C', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('temperature')}</span>
          </div>
          
          {/* Humidity */}
          <div className="card p-4 flex flex-col items-center justify-center">
            <Droplets size={24} style={{ color: '#5D9CEC', marginBottom: '8px' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1C2B1E' }}>{weatherData.humidity || 65}%</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '11px', fontWeight: 600, color: '#7A8A7C', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('humidity')}</span>
          </div>
          
          {/* Wind Speed */}
          <div className="card p-4 flex flex-col items-center justify-center">
            <Wind size={24} style={{ color: '#2F5D3A', marginBottom: '8px' }} />
            <div className="flex items-baseline gap-1">
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1C2B1E' }}>{weatherData.windSpeed || 10}</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px', fontWeight: 700, color: '#1C2B1E' }}>km/h</span>
            </div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '11px', fontWeight: 600, color: '#7A8A7C', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('wind_speed')}</span>
          </div>
          
          {/* Rain Probability */}
          <div className="card p-4 flex flex-col items-center justify-center">
            <CloudRain size={24} style={{ color: '#5D9CEC', marginBottom: '8px' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 700, color: '#1C2B1E' }}>{weatherData.rainProb}%</span>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '11px', fontWeight: 600, color: '#7A8A7C', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('rain_prob')}</span>
          </div>

          {/* Advisory */}
          <div className="col-span-2 card p-4 flex items-start gap-3 border-l-4" style={{ borderLeftColor: '#D9C27A', background: 'rgba(217,194,122,0.05)' }}>
            <AlertTriangle size={20} style={{ color: '#D9A027', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', fontWeight: 700, color: '#D9A027', marginBottom: '4px' }}>{t('ai_advisory')}</h3>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#1C2B1E', lineHeight: 1.6 }}>
                {weatherData.advisory}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Market Trends */}
      <div className="mt-8 mb-6">
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: '#1C2B1E', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: '#2F5D3A' }} /> {t('mandi_prices')}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-16 card animate-shimmer"></div>
             ))}
          </div>
        ) : (
          <div className="space-y-3">
            {marketPrices.map((item, idx) => (
              <div key={idx} className="card p-4 flex flex-col transition-all hover:-translate-y-0.5">
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1C2B1E' }}>{item.crop}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 700, color: '#1C2B1E' }}>{item.price}</span>
                    <span style={{ 
                      fontSize: '10px', padding: '4px 8px', borderRadius: '8px', fontWeight: 800,
                      background: item.trend === 'up' ? 'rgba(47,93,58,0.1)' : item.trend === 'down' ? 'rgba(192,57,43,0.1)' : 'rgba(35,66,41,0.05)',
                      color: item.trend === 'up' ? '#2F5D3A' : item.trend === 'down' ? '#C0392B' : '#7A8A7C'
                    }}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-[#7A8A7C] uppercase tracking-wider">
                  <span>{item.mandi}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
            {marketPrices.length === 0 && (
              <p style={{ textAlign: 'center', fontFamily: 'Manrope, sans-serif', fontSize: '13px', color: '#7A8A7C', padding: '16px 0' }}>{t('no_market_data')}</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/diagnose" className="card p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg">
          <div style={{ background: 'rgba(47,93,58,0.08)', padding: '16px', borderRadius: '50%' }}>
            <span style={{ fontSize: '32px' }}>📷</span>
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1C2B1E' }}>{t('scan_leaf')}</span>
        </Link>
        <Link to="/map" className="card p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg">
          <div style={{ background: 'rgba(47,93,58,0.08)', padding: '16px', borderRadius: '50%' }}>
            <span style={{ fontSize: '32px' }}>🗺️</span>
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', fontWeight: 700, color: '#1C2B1E' }}>{t('farm_map')}</span>
        </Link>
      </div>
    </div>
  );
}
