import { useState, useEffect } from 'react';
import { Bell, Settings, Wind, Droplets, CloudRain, ChevronRight, CloudSun, MapPin, Sprout, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { CardSkeleton, WeatherSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useFarmContext } from '../context/FarmContext';
import { useUserContext } from '../context/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { myFarms } = useFarmContext();
  const { userName } = useUserContext();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    // 1. Fetch weather ONLY when hardware GPS resolves
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
          // Pass the precise hardware coords to backend
          loadWeather(lat, lon);
        },
        (err) => {
          console.error("GPS Denied:", err);
          setUserLocation('Location Access Denied');
          setWeatherLoading(false);
          // STRICT CONSTRAINT: No hardcoded fallback coordinates allowed.
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
        console.error("Weather API returned error:", weatherRes.status);
        setWeather(null);
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Farm context data parsing
  const displayFarms = myFarms.map(f => {
    let score = f.healthScore !== undefined && f.healthScore !== null ? f.healthScore : undefined;
    
    let color = 'bg-brand-text/50';
    if (score !== undefined) {
      if (score > 80) color = 'bg-brand-green';
      else if (score >= 50) color = 'bg-orange-400';
      else color = 'bg-brand-danger';
    }

    return {
      id: f.id,
      name: f.name || 'My Farm',
      size: f.area_acres ? `${f.area_acres} Acres` : 'Unknown',
      crop: f.crop || 'Unknown',
      scoreDisplay: score !== undefined ? `${score}%` : 'Evaluating...',
      location: f.locationName || f.location || 'Unknown Location',
      yield: f.yield || 'Evaluating...',
      status: score !== undefined ? (score > 80 ? 'Healthy' : score >= 50 ? 'Watch' : 'High Risk') : 'Pending',
      color: color
    };
  });

  return (
    <div className="pt-6 px-5 md:px-8 pb-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sprout size={20} className="text-brand-green md:w-8 md:h-8" strokeWidth={1.5} />
            <h1 className="font-serif tracking-tight text-[22px] md:text-4xl lg:text-5xl font-bold text-brand-text truncate max-w-[200px] md:max-w-none">
              Hello, {userName ? userName : 'Farmer'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-brand-text-muted text-sm md:text-base">
            <MapPin size={13} className="md:w-4 md:h-4" />
            <span>{userLocation || 'Detecting location...'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/alerts')} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-danger rounded-full ring-2 ring-white"></span>
          </button>
          <button onClick={() => navigate('/menu')} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Weather Widget */}
      {weatherLoading ? (
        <WeatherSkeleton />
      ) : weather ? (
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <div className="flex flex-col">
              <span className="text-5xl font-semibold text-brand-text">{weather.temp}°</span>
              <span className="text-brand-text-muted text-sm mt-0.5">{weather.condition}</span>
            </div>
            <div className="w-16 h-16 bg-brand-bg rounded-2xl flex items-center justify-center">
              <CloudSun size={36} className="text-brand-accent" strokeWidth={1.5} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-text/5">
            <div className="flex flex-col items-center gap-1">
              <Wind size={15} className="text-brand-text-muted" />
              <span className="text-xs font-semibold text-brand-text">{weather.wind} km/h</span>
              <span className="text-[9px] text-brand-text-muted font-medium">Wind</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Droplets size={15} className="text-brand-text-muted" />
              <span className="text-xs font-semibold text-brand-text">{weather.humidity}%</span>
              <span className="text-[9px] text-brand-text-muted font-medium">Humidity</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CloudRain size={15} className="text-brand-text-muted" />
              <span className="text-xs font-semibold text-brand-text">{weather.rainProb} mm</span>
              <span className="text-[9px] text-brand-text-muted font-medium">Rain</span>
            </div>
          </div>
          {weather.tempChange && (
            <div className="mt-4 pt-3 border-t border-brand-text/5 text-center">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase block mb-1">Advisory</span>
              <span className="text-xs font-medium text-brand-text leading-relaxed block px-2">{weather.tempChange}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Fruit', 'Orchards', 'Grains'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              filter === cat ? 'bg-brand-green text-white shadow-sm' : 'bg-white text-brand-text-muted hover:text-brand-text shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* My Fields Section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-brand-text">My Fields</h3>
        <button onClick={() => navigate('/map')} className="text-brand-text-muted text-sm font-semibold flex items-center hover:text-brand-accent transition-colors gap-0.5">
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
              <button
                onClick={() => navigate('/map')}
                className="primary-btn !w-auto !px-6"
              >
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
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-brand-text text-[16px] truncate">{farm.name}</h4>
                      <span className="bg-brand-green-light text-brand-green text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ml-2">
                        {farm.yield}
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
              <div className="relative h-40 mx-3 mb-3 rounded-2xl overflow-hidden bg-brand-bg">
                <img src="/farm_background.png" alt={farm.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${farm.color}`}></div>
                  <span className="text-white text-xs font-bold drop-shadow-md">Health Score: {farm.scoreDisplay}</span>
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
