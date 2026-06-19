import { useState, useEffect } from 'react';
import { Bell, ArrowLeft, CloudRain, Thermometer, Bug, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const ALERTS_BY_CROP = {
  Soybean: [
    { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Heavy Rain Expected', message: '45mm rainfall predicted. Consider postponing fungicide application on Soybean.', time: '2 hours ago', urgent: true },
    { icon: Bug, color: 'text-brand-danger', bg: 'bg-brand-danger/10', title: 'Aphid Activity Nearby', message: 'Aphids reported in neighboring Soybean fields. Inspect your crop within 48 hours.', time: '1 day ago', urgent: false },
  ],
  Cotton: [
    { icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10', title: 'Heat Stress Risk', message: 'Temperatures above 38°C expected. Boll retention may be affected in Cotton.', time: '3 hours ago', urgent: true },
    { icon: Bug, color: 'text-brand-danger', bg: 'bg-brand-danger/10', title: 'Pink Bollworm Alert', message: 'PBW traps show increased counts. Monitor your Cotton fields regularly.', time: '12 hours ago', urgent: false },
  ],
  Wheat: [
    { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Rust Warning', message: 'Humidity above 90% for 3 consecutive days — ideal conditions for Yellow Rust in Wheat.', time: '6 hours ago', urgent: true },
  ],
  Rice: [
    { icon: Bug, color: 'text-brand-danger', bg: 'bg-brand-danger/10', title: 'Brown Plant Hopper', message: 'BPH infestation reported in nearby Rice paddies. Check your crop immediately.', time: '4 hours ago', urgent: true },
    { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Excess Rainfall', message: 'Water levels may rise. Ensure drainage channels are clear for your Rice fields.', time: '1 day ago', urgent: false },
  ],
};

export default function Alerts() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('fasal_farms');
    if (stored) {
      const parsed = JSON.parse(stored);
      setFarms(parsed);
      if (parsed.length > 0) setSelectedFarmId(parsed[0].id);
    }
  }, []);

  const activeFarm = farms.find(f => f.id === selectedFarmId);
  const alerts = activeFarm ? (ALERTS_BY_CROP[activeFarm.crop] || ALERTS_BY_CROP.Soybean) : [];
  const urgentCount = alerts.filter(a => a.urgent).length;

  return (
    <div className="pt-6 px-5 pb-24 h-full flex-1 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif tracking-tight text-xl font-bold text-brand-text">Notifications</h1>
        {urgentCount > 0 && (
          <span className="ml-auto bg-brand-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{urgentCount} Urgent</span>
        )}
      </div>

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
      ) : (
        <>
          {farms.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
              {farms.map(farm => (
                <button
                  key={farm.id}
                  onClick={() => setSelectedFarmId(farm.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedFarmId === farm.id ? 'bg-brand-green text-white shadow-sm' : 'bg-white text-brand-text-muted hover:text-brand-text shadow-sm'
                  }`}
                >
                  {farm.name}
                </button>
              ))}
            </div>
          )}

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-5">
                <Bell size={36} className="text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-2">No New Alerts</h3>
              <p className="text-sm text-brand-text-muted max-w-[260px] leading-relaxed">
                No active alerts for <strong className="text-brand-text">{activeFarm?.name}</strong>. We will notify you if anything changes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeFarm && (
                <div className="card-flat px-4 py-2.5 mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-brand-text-muted">Alerts for</span>
                  <span className="text-xs font-bold text-brand-text">{activeFarm.name} • {activeFarm.crop}</span>
                </div>
              )}
              {alerts.map((alert, idx) => {
                const Icon = alert.icon;
                return (
                  <div key={idx} className={`card p-4 animate-fade-in-up ${alert.urgent ? 'border-l-4 border-l-brand-danger' : ''}`} style={{ animationDelay: `${idx * 80}ms` }}>
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
        </>
      )}
    </div>
  );
}
