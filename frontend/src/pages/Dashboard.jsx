import { useState, useEffect } from 'react';
import { CloudRain, Sun, TrendingUp, AlertTriangle, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [weather, setWeather] = useState({ temp: 28, condition: 'Sunny', rainProb: 10 });
  
  // Dummy data for now
  const marketPrices = [
    { crop: 'Wheat', price: '₹2,200', trend: 'up' },
    { crop: 'Tomato', price: '₹1,500', trend: 'down' },
    { crop: 'Onion', price: '₹1,800', trend: 'up' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Kisaan! 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Your farm overview for today.</p>
        </div>
      </div>

      {/* Weather & Advisory Card */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          {weather.rainProb > 50 ? <CloudRain size={80} /> : <Sun size={80} />}
        </div>
        <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <Cloud size={20} /> Current Weather
        </h2>
        <div className="flex items-end gap-4 mb-4">
          <span className="text-5xl font-light">{weather.temp}°C</span>
          <span className="text-slate-300 text-lg mb-1">{weather.condition}</span>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm mt-4">
          <h3 className="font-medium text-amber-400 flex items-center gap-2 mb-1">
            <AlertTriangle size={16} /> AI Advisory
          </h3>
          <p className="text-sm text-slate-300">
            {weather.rainProb > 50 
              ? "Heavy rain expected tomorrow. Avoid spraying pesticides today as they might wash away."
              : "Clear weather ahead. Good time for pesticide application if needed."}
          </p>
        </div>
      </div>

      {/* Market Trends */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> Mandi Prices (Live)
        </h2>
        <div className="space-y-3">
          {marketPrices.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
              <span className="font-medium">{item.crop}</span>
              <div className="flex items-center gap-3">
                <span>{item.price}/qtl</span>
                <span className={`text-xs px-2 py-1 rounded ${item.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {item.trend === 'up' ? '▲' : '▼'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">Data fetched from data.gov.in APIs</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/diagnose" className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/80 transition-colors">
          <div className="bg-emerald-500/20 p-4 rounded-full text-emerald-400">
            <span className="text-3xl">📷</span>
          </div>
          <span className="font-medium">Scan Crop</span>
        </Link>
        <Link to="/map" className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-800/80 transition-colors">
          <div className="bg-blue-500/20 p-4 rounded-full text-blue-400">
            <span className="text-3xl">🗺️</span>
          </div>
          <span className="font-medium">Farm Map</span>
        </Link>
      </div>
    </div>
  );
}
