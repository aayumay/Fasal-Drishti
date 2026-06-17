import { Droplets, Thermometer, Wind, CloudRain, Sprout, Lightbulb, CheckCircle2, TrendingUp, ArrowLeft, Camera, X, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FactorsSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import VoiceSpeakerButton from '../components/VoiceSpeakerButton';
import { useLanguage } from '../context/LanguageContext';
import VendorDrawer from '../components/VendorDrawer';

export default function Diagnose() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [spread, setSpread] = useState(null);
  const [spreadLoading, setSpreadLoading] = useState(true);
  const [activeFarm, setActiveFarm] = useState(null);

  // Scan Leaf State
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [isVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);

  useEffect(() => {
    const localFarms = localStorage.getItem('fasal_farms');
    const activeId = localStorage.getItem('fasal_active_farm_id');
    
    if (localFarms) {
      const parsed = JSON.parse(localFarms);
      if (parsed.length > 0) {
        if (activeId) {
          const found = parsed.find(f => f.id === activeId);
          setActiveFarm(found || parsed[0]);
        } else {
          setActiveFarm(parsed[0]);
        }
      }
    }
    fetch('/api/weather')
      .then(res => { if (!res.ok) throw new Error('API Error'); return res.json(); })
      .then(data => setWeather({ temp: data.temp || 32, rainProb: data.rainProb || 40, condition: data.condition || '', windSpeed: data.windSpeed || 18, humidity: data.humidity || 92 }))
      .catch(() => setWeatherError('Could not fetch weather data'))
      .finally(() => setWeatherLoading(false));

    fetch('/api/disease/spread', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farm_id: "mock1", current_red_zone_acres: 0.5 })
    })
      .then(res => { if (!res.ok) throw new Error('API Error'); return res.json(); })
      .then(data => setSpread(data))
      .catch(() => {
        setSpread({
          direction: "North-East",
          confidence: 85,
          progression: [
            { day: "Day 1", predicted_acres: 0.5 },
            { day: "Day 2", predicted_acres: 0.65 },
            { day: "Day 3", predicted_acres: 0.8 },
            { day: "Day 4", predicted_acres: 1.1 },
            { day: "Day 5", predicted_acres: 1.5 }
          ]
        });
      })
      .finally(() => setSpreadLoading(false));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanModalOpen(true);
    setScanLoading(true);
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Diagnosis failed');
      const data = await res.json();
      setScanResult(data);
    } catch (error) {
      setScanResult({ error: true, disease: 'Analysis Failed', action: 'Please check your connection and try again.' });
    } finally {
      setScanLoading(false);
    }
    
    // Reset file input so same file can be uploaded again if needed
    e.target.value = null;
  };

  return (
    <div className="pt-6 px-5 pb-24 flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/home')} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-brand-text">Field Insights</h1>
      </div>

      {activeFarm ? (
        <>
          {/* Factors Influencing Risk */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-brand-text mb-4">Factors Influencing Risk</h3>
            {weatherLoading ? (
              <FactorsSkeleton />
            ) : weatherError ? (
              <ErrorState message={weatherError} />
            ) : weather ? (
              <div className="card p-5 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-brand-bg rounded-2xl p-4 text-center">
                    <Droplets size={18} className="text-brand-accent mx-auto mb-2" />
                    <p className="text-xl font-bold text-brand-text">{weather.humidity}%</p>
                    <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">Humidity</p>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 text-center">
                    <Thermometer size={18} className="text-brand-accent mx-auto mb-2" />
                    <p className="text-xl font-bold text-brand-text">{weather.temp}°C</p>
                    <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">Temperature</p>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 text-center">
                    <Wind size={18} className="text-brand-accent mx-auto mb-2" />
                    <p className="text-xl font-bold text-brand-text">{weather.windSpeed}</p>
                    <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">Wind km/h</p>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 text-center">
                    <CloudRain size={18} className="text-brand-accent mx-auto mb-2" />
                    <p className="text-xl font-bold text-brand-text">{weather.rainProb}%</p>
                    <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">Rain Prob.</p>
                  </div>
                  <div className="bg-brand-bg rounded-2xl p-4 text-center col-span-2">
                    <Sprout size={18} className="text-brand-accent mx-auto mb-2" />
                    <p className="text-xl font-bold text-brand-text">{activeFarm.crop}</p>
                    <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">Crop Evaluated</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Disease Spread Forecast */}
          {spreadLoading ? (
            <div className="card p-5 mb-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-brand-text/5 rounded animate-pulse" />
                <div className="h-4 w-44 bg-brand-text/5 rounded animate-pulse" />
              </div>
              <div className="h-20 bg-brand-text/5 rounded-2xl animate-pulse mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-brand-text/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : spread ? (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-brand-danger" />
                <h3 className="text-sm font-bold text-brand-text">Disease Spread Forecast</h3>
              </div>
              <div className="card p-5 mb-4 border-l-4 border-l-brand-danger">
                <p className="text-sm text-brand-text-muted leading-relaxed">
                  Based on wind heading <strong className="text-brand-text">{spread.direction}</strong>, disease risk zone is predicted to expand with <strong className="text-brand-green">{spread.confidence}%</strong> confidence.
                </p>
              </div>
              <div className="relative pl-5 ml-2 border-l-2 border-brand-text/10 space-y-3">
                {spread.progression.map((prog, idx) => {
                  const riskLevel = idx === 0 ? 'Low' : idx === 1 ? 'Medium' : idx === 4 ? 'Critical' : 'High';
                  const riskColors = { Low: 'bg-brand-green border-brand-green', Medium: 'bg-brand-accent border-brand-accent', High: 'bg-orange-400 border-orange-400', Critical: 'bg-brand-danger border-brand-danger' };
                  const riskTextColors = { Low: 'text-brand-green bg-brand-green/10', Medium: 'text-brand-accent bg-brand-accent/10', High: 'text-orange-400 bg-orange-400/10', Critical: 'text-brand-danger bg-brand-danger/10' };
                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[19px] top-3 w-3 h-3 rounded-full border-2 border-white ${riskColors[riskLevel]}`} />
                      <div className="card p-3.5">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-semibold ${idx === 0 ? 'text-brand-text' : 'text-brand-text-muted'}`}>
                            {prog.day} {idx === 0 && '(Today)'}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-brand-text-muted">{prog.predicted_acres} Acres</span>
                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg ${riskTextColors[riskLevel]}`}>{riskLevel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* AI Explainability Card */}
          <div className="card p-5 mb-6 border-l-4 border-l-brand-danger animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-brand-danger" />
              <h3 className="font-bold text-brand-text text-sm">Why Are We Predicting Risk?</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-brand-bg rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] text-brand-text-muted font-medium">Humidity</p>
                <p className="text-brand-text font-bold text-sm">{weather?.humidity || 92}% <span className="text-brand-danger text-[10px] ml-1 font-medium">(High)</span></p>
              </div>
              <div className="bg-brand-bg rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] text-brand-text-muted font-medium">Wind Speed</p>
                <p className="text-brand-text font-bold text-sm">{weather?.windSpeed || 18} km/h <span className="text-brand-danger text-[10px] ml-1 font-medium">(Spread)</span></p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-brand-danger/5 p-3.5 rounded-xl border border-brand-danger/10">
              <span className="text-brand-text text-[13px] font-medium leading-relaxed">
                These conditions create the perfect environment for rapid fungal growth on your {activeFarm.crop}. <span className="text-brand-danger font-bold">Crop Stress Detected.</span>
              </span>
            </div>
          </div>

          {/* What You Can Do */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-brand-text mb-3">What You Can Do</h3>
            <div className="card p-5 space-y-3">
              {['Apply recommended fungicide', 'Ensure proper field drainage', 'Avoid overhead irrigation', 'Monitor field after 3 days'].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-brand-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-brand-text-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/action-plan')} className="primary-btn">
            View Action Plan
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-8 mt-10 shadow-sm text-center border border-dashed border-brand-green/30">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-4">
            <Sprout size={24} className="text-brand-green" />
          </div>
          <h3 className="text-base font-bold text-brand-text mb-2">No Farm Data</h3>
          <p className="text-xs text-brand-text-muted mb-6 leading-relaxed">
            We need a farm boundary to analyze satellite data and provide disease predictions.
          </p>
          <button 
            onClick={() => navigate('/map')}
            className="bg-brand-green/10 text-brand-green font-bold text-xs px-6 py-3 rounded-xl hover:bg-brand-green/20 transition-colors w-full"
          >
            Go to Map & Draw Farm
          </button>
        </div>
      )}

      {/* Scan Leaf FAB */}
      {activeFarm && (
        <div className="fixed bottom-24 right-5 z-40">
          <label className="flex items-center justify-center w-14 h-14 bg-brand-green text-white rounded-full shadow-xl cursor-pointer hover:bg-brand-green/90 transition-transform active:scale-95 group">
            <Camera size={24} />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            {/* Tooltip */}
            <span className="absolute right-16 bg-brand-text text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Scan Leaf
            </span>
          </label>
        </div>
      )}

      {/* Diagnosis Result Modal */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 pb-10 max-h-[95vh] overflow-y-auto relative">
            <button onClick={() => setScanModalOpen(false)} className="absolute top-4 right-4 text-brand-text-muted hover:text-brand-text bg-brand-bg rounded-full p-1">
              <X size={20} />
            </button>
            
            {scanLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 size={40} className="text-brand-green animate-spin mb-4" />
                <h3 className="text-lg font-bold text-brand-text">Analyzing Leaf...</h3>
                <p className="text-sm text-brand-text-muted text-center mt-2">AI is scanning for pests and diseases.</p>
              </div>
            ) : scanResult ? (
              <div className="py-2 animate-fade-in">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 bg-brand-bg">
                  {scanResult.predictionClass === 'Invalid_Image' ? (
                    <AlertTriangle size={32} className="text-brand-accent" />
                  ) : scanResult.severity === 'Critical' || scanResult.severity === 'High' ? (
                    <AlertTriangle size={32} className="text-brand-danger" />
                  ) : scanResult.error ? (
                    <X size={32} className="text-brand-danger" />
                  ) : (
                    <ShieldCheck size={32} className="text-brand-green" />
                  )}
                </div>
                
                <h3 className={`text-2xl font-bold text-center mb-1 ${scanResult.severity === 'Critical' ? 'text-brand-danger' : 'text-brand-text'}`}>
                  {scanResult.disease}
                </h3>
                {!scanResult.error && (
                  <p className="text-center text-brand-text-muted text-sm mb-6">
                    Confidence: <span className="font-bold text-brand-text">{scanResult.confidence}%</span>
                  </p>
                )}
                
                <div className={`rounded-2xl p-4 mb-6 ${scanResult.predictionClass === 'Invalid_Image' ? 'bg-orange-400/10 border border-orange-400/50' : 'bg-brand-bg'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xs font-bold text-brand-text-muted uppercase mt-1">Recommended Action</h4>
                    <VoiceSpeakerButton text={scanResult.action} lang={language} />
                  </div>
                  <p className="text-sm text-brand-text font-medium leading-relaxed">
                    {scanResult.action}
                  </p>
                </div>

                {!scanResult.error && scanResult.predictionClass !== 'Invalid_Image' && (
                  <button 
                    onClick={() => setIsVendorDrawerOpen(true)}
                    className="mb-4 flex items-center justify-center w-full gap-2 bg-brand-text hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors"
                  >
                    <span className="text-lg">🛒</span> Procure Recommended Treatment
                  </button>
                )}
                
                <div className="mt-4">
                  <button onClick={() => setScanModalOpen(false)} className="primary-btn w-full">
                    {scanResult.predictionClass === 'Invalid_Image' ? 'Try Again' : 'Done'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <VendorDrawer isOpen={isVendorDrawerOpen} onClose={() => setIsVendorDrawerOpen(false)} />
    </div>
  );
}
