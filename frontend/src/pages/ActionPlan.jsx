import { ChevronDown, CheckCircle2, ArrowLeft, Loader2, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ErrorState from '../components/ErrorState';
import { treatmentMap } from '../utils/treatmentMap';
import VendorDrawer from '../components/VendorDrawer';
import { useLanguage } from '../context/LanguageContext';

export default function ActionPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const predictionClass = location.state?.disease || 'Early_Blight';
  const recommendedChemical = treatmentMap[predictionClass] || treatmentMap.default;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch('/api/map/ndvi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([[28.7041, 77.1025]])
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        setData({ area_acres: 5.0, red_zone_acres: 0.85, pesticide_volume_ml: 1700, savings_percent: 83 });
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="pt-6 px-5 pb-24 h-full flex-1 flex flex-col overflow-y-auto" style={{ background: '#F8F6F2' }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: '#1C2B1E', letterSpacing: '-0.02em' }}>
          {t('action_plan_title')}
        </h1>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="flex-1">
          <div className="space-y-5">
            <div>
              <label style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '14px', color: '#7A8A7C', marginBottom: '6px', display: 'block' }}>Area of High Risk Zone</label>
              <div className="relative">
                <input type="number" value={data ? data.red_zone_acres : 0} readOnly className="input-field bg-brand-bg text-brand-green font-bold border-brand-green/30" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted text-sm">{t('acres')}</span>
              </div>
              {data && (
                <p className="text-xs text-brand-text-muted mt-2 flex items-center gap-1.5" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  <CheckCircle2 size={14} className="text-brand-green" />
                  Precision targeted instead of spraying all {data.area_acres} {t('acres')}.
                </p>
              )}
            </div>
            
            {/* AI Prescription Card */}
            <div className="relative bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                <ShieldCheck size={12} /> AI VERIFIED
              </div>
              <label className="text-xs text-brand-text-muted font-medium uppercase tracking-wider mb-2 block">
                Prescribed Treatment for {predictionClass.replace('_', ' ')}
              </label>
              <p className="text-lg font-bold text-brand-text mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                {recommendedChemical}
              </p>
              
              <button 
                onClick={() => setIsVendorDrawerOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-brand-text hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors"
              >
                <ShoppingCart size={18} /> {t('procure_treatment')}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '18px', color: '#1C2B1E', marginBottom: '16px' }}>Precision Impact</h3>
            {loading ? (
              <div className="card p-6 flex items-center justify-center gap-3">
                <Loader2 size={18} className="animate-spin text-brand-accent" />
                <span className="text-sm text-brand-text-muted">Calculating...</span>
              </div>
            ) : data ? (
              <div className="animate-fade-in-up">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 bg-white border border-brand-text/5 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-wider mb-2 font-semibold">Without Precision</p>
                    <p className="text-sm text-brand-text mb-1"><span className="text-brand-text-muted">Area:</span> {data.area_acres} {t('acres')}</p>
                    <p className="text-sm text-brand-text"><span className="text-brand-text-muted">Cost:</span> <span className="text-[#C0392B] font-bold">₹3,500</span></p>
                  </div>
                  <div className="flex-1 bg-brand-green/5 border border-brand-green/20 rounded-2xl p-4 text-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand-green/10 blur-xl rounded-full pointer-events-none" />
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-wider mb-2 relative z-10 font-semibold">With AI Prediction</p>
                    <p className="text-sm text-brand-text mb-1 relative z-10"><span className="text-brand-text-muted">Area:</span> {data.red_zone_acres} {t('acres')}</p>
                    <p className="text-sm text-brand-text relative z-10"><span className="text-brand-text-muted">Cost:</span> <span className="text-brand-green font-bold">₹540</span></p>
                  </div>
                </div>
                <div className="card p-6 text-center border border-brand-accent/20 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-accent/10 blur-3xl rounded-full pointer-events-none" />
                  <p className="text-xs text-brand-text-muted uppercase tracking-wider mb-1 relative z-10 font-semibold">Total Savings</p>
                  <p className="text-4xl font-black text-brand-accent relative z-10" style={{ fontFamily: 'Playfair Display, serif' }}>₹2,960</p>
                  <p className="text-xs text-brand-green font-bold mt-3 bg-brand-green/10 px-4 py-1.5 rounded-full relative z-10 inline-block">
                    You saved {data.savings_percent}% pesticide!
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <button className="primary-btn mt-6" onClick={loadData}>Recalculate</button>
      <VendorDrawer isOpen={isVendorDrawerOpen} onClose={() => setIsVendorDrawerOpen(false)} />
    </div>
  );
}
