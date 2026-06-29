import { useState, useEffect } from 'react';
import { Bell, Settings, Wind, Droplets, CloudRain, ChevronRight, CloudSun, MapPin, Sprout, Plus, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { CardSkeleton, WeatherSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFarmContext } from '../context/FarmContext';
import { useUserContext } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const S = {
  label: { fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B0BDB2' },
  sectionTitle: { fontFamily: 'Playfair Display,serif', fontWeight: 600, fontSize: '20px', color: '#1C2B1E', letterSpacing: '-0.01em' },
};

const Home = () => {
  const navigate = useNavigate();
  const { myFarms } = useFarmContext();
  const { userName } = useUserContext();
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || 'Unknown Location';
            const state = geoData.principalSubdivision || geoData.countryName || '';
            setUserLocation(`${city}${state ? `, ${state}` : ''}`);
          } catch {
            setUserLocation('Location unavailable');
          }
          loadWeather(lat, lon);
        },
        (err) => {
          console.error("GPS Denied:", err);
          setUserLocation('Location Access Denied');
          setWeatherLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setUserLocation('GPS Not Supported');
      setWeatherLoading(false);
    }
  }, []);

  const loadWeather = async (lat, lon) => {
    try {
      const weatherRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        setWeather({
          temp: wData.temp,
          condition: wData.condition,
          rainProb: wData.rainProb,
          humidity: wData.humidity,
          wind: wData.windSpeed,
          tempChange: wData.advisory || ''
        });
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.warn("Weather fetch failed, using fallback:", err);
      setWeather({
        temp: 28,
        condition: 'Partly Cloudy',
        rainProb: 20,
        humidity: 65,
        wind: 12,
        tempChange: 'Favorable conditions for spraying fungicides today.'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const displayFarms = myFarms.map(f => {
    let score = f.healthScore !== undefined && f.healthScore !== null ? f.healthScore : undefined;
    let colorDot = '#B0BDB2';
    let badge = '';
    if (score !== undefined) {
      if (score > 80) { colorDot = '#2F5D3A'; badge = t('healthy'); }
      else if (score >= 50) { colorDot = '#D9A027'; badge = t('watch'); }
      else { colorDot = '#C0392B'; badge = t('risk'); }
    }
    return {
      id: f.id,
      name: f.name || 'My Farm',
      size: f.area_acres ? `${f.area_acres} Acres` : 'Unknown',
      crop: f.crop || 'Unknown',
      scoreDisplay: score !== undefined ? `${score}%` : t('evaluating'),
      location: f.locationName || f.location || 'Unknown Location',
      yield: f.yield || t('evaluating'),
      status: score !== undefined ? badge : 'Pending',
      colorDot, badge,
    };
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('greeting_morning') : hour < 17 ? t('greeting_afternoon') : t('greeting_evening');

  return (
    <div className="pt-6 px-5 md:px-8 pb-6 h-full overflow-y-auto" style={{ background: '#F8F6F2' }}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p style={S.label} className="mb-1">{greeting}</p>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              fontSize: 'clamp(22px, 5vw, 36px)',
              color: '#1C2B1E',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {userName ? userName : t('farmer')}
          </h1>
          {userLocation && (
            <div className="flex items-center gap-1.5 mt-1.5" style={{ color: '#B0BDB2' }}>
              <MapPin size={12} strokeWidth={1.8} />
              <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: '12px', fontWeight: 500 }}>
                {userLocation}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => navigate('/alerts')}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={{ background: '#fff', border: '1px solid rgba(35,66,41,0.09)', boxShadow: '0 1px 4px rgba(35,66,41,0.06)', color: '#7A8A7C' }}
          >
            <Bell size={17} strokeWidth={1.7} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: '#C0392B' }} />
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={{ background: '#fff', border: '1px solid rgba(35,66,41,0.09)', boxShadow: '0 1px 4px rgba(35,66,41,0.06)', color: '#7A8A7C' }}
          >
            <Settings size={17} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {/* ── Weather Card ── */}
      {weatherLoading ? (
        <WeatherSkeleton />
      ) : weather ? (
        <div
          className="animate-fade-in mb-6"
          style={{
            background: 'linear-gradient(135deg, #234229 0%, #2F5D3A 100%)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 24px rgba(35,66,41,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: '-20px', top: '-20px',
            width: '120px', height: '120px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
          }} />
          <div className="flex justify-between items-start mb-5">
            <div>
              <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 500, fontSize: '12px', color: 'rgba(248,246,242,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                {t('current_weather')}
              </p>
              <div style={{ fontFamily: 'Playfair Display,serif', fontWeight: 500, fontSize: '52px', color: '#F8F6F2', lineHeight: 1 }}>
                {weather.temp}°
              </div>
              <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: '13px', color: 'rgba(248,246,242,0.7)', fontWeight: 500, marginTop: '4px' }}>
                {weather.condition}
              </p>
            </div>
            <div
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CloudSun size={28} strokeWidth={1.4} style={{ color: '#D9C27A' }} />
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            {[
              { icon: Wind, label: t('wind'), value: `${weather.wind} km/h` },
              { icon: Droplets, label: t('humidity'), value: `${weather.humidity}%` },
              { icon: CloudRain, label: t('rain'), value: `${weather.rainProb} mm` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon size={14} strokeWidth={1.7} style={{ color: 'rgba(248,246,242,0.5)' }} />
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '13px', color: '#F8F6F2' }}>{value}</span>
                <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 500, fontSize: '9px', color: 'rgba(248,246,242,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              </div>
            ))}
          </div>

          {weather.tempChange && (
            <div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: '11px', fontWeight: 500, color: 'rgba(248,246,242,0.6)', lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: '#D9C27A' }}>{t('advisory')}</span>
                {weather.tempChange}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Filter pills ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {[{id: 'All', label: t('filter_all')}, {id: 'Fruit', label: t('filter_fruit')}, {id: 'Orchards', label: t('filter_orchards')}, {id: 'Grains', label: t('filter_grains')}].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              fontFamily: 'Manrope,sans-serif',
              fontWeight: 600,
              fontSize: '13px',
              padding: '8px 18px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              background: filter === cat.id ? '#234229' : '#fff',
              color: filter === cat.id ? '#F8F6F2' : '#7A8A7C',
              border: filter === cat.id ? '1px solid #234229' : '1px solid rgba(35,66,41,0.1)',
              boxShadow: filter === cat.id ? '0 2px 8px rgba(35,66,41,0.2)' : '0 1px 3px rgba(35,66,41,0.04)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── My Fields ── */}
      <div className="flex justify-between items-center mb-4">
        <h2 style={S.sectionTitle}>{t('my_fields')}</h2>
        <button
          onClick={() => navigate('/map')}
          className="flex items-center gap-0.5 transition-colors duration-200"
          style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '13px', color: '#7A8A7C' }}
        >
          {t('view_all')} <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-28 md:pb-8">
        {displayFarms.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={t('no_fields_yet')}
            message={t('no_fields_desc')}
            action={
              <button onClick={() => navigate('/map')} className="primary-btn !w-auto !px-8">
                {t('add_first_field')}
              </button>
            }
          />
        ) : (
          displayFarms.map((farm, idx) => (
            <div
              key={farm.id}
              className="card overflow-hidden cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => navigate('/map')}
            >
              {/* Farm image */}
              <div className="relative" style={{ height: '148px', overflow: 'hidden' }}>
                <img
                  src="/farm_background.png"
                  alt={farm.name}
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,43,30,0.6) 0%, transparent 55%)' }} />
                {/* Health badge */}
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(248,246,242,0.92)', backdropFilter: 'blur(8px)' }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: farm.colorDot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '11px', color: '#1C2B1E' }}>
                    {farm.scoreDisplay}
                  </span>
                </div>
                {/* Crop tag */}
                <div
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(248,246,242,0.9)', backdropFilter: 'blur(8px)' }}
                >
                  <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '10px', color: '#2F5D3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {farm.crop}
                  </span>
                </div>
              </div>

              {/* Farm details */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontWeight: 600, fontSize: '16px', color: '#1C2B1E', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                      {farm.name}
                    </h3>
                    <div className="flex items-center gap-1" style={{ color: '#B0BDB2' }}>
                      <MapPin size={10} strokeWidth={1.8} />
                      <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: '11px', fontWeight: 500 }} className="truncate">
                        {farm.location}
                      </span>
                      <span style={{ fontSize: '11px', margin: '0 4px' }}>·</span>
                      <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                        {farm.size}
                      </span>
                    </div>
                  </div>
                  <div
                    className="ml-3 px-2.5 py-1 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(47,93,58,0.08)', border: '1px solid rgba(47,93,58,0.12)' }}
                  >
                    <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '11px', color: '#2F5D3A' }}>
                      {farm.yield !== 'Evaluating...' ? farm.yield : farm.status}
                    </span>
                  </div>
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
