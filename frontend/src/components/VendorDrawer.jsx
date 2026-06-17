import React from 'react';
import { X, PhoneCall, ShoppingCart, MapPin, Store } from 'lucide-react';

const vendors = [
  {
    "id": "v1",
    "type": "physical",
    "name": "Waghodia Krishi Seva Kendra",
    "distance": "3.2 km",
    "productName": "Blitox 50 (Copper Fungicide)",
    "price": "₹450 / 500g",
    "contact": "+919876543210",
    "inStock": true,
    "badge": "Verified Local Partner"
  },
  {
    "id": "v2",
    "type": "physical",
    "name": "Gujarat Agro Center",
    "distance": "7.5 km",
    "productName": "Tata Rallis Copper Oxychloride",
    "price": "₹420 / 500g",
    "contact": "+919876511111",
    "inStock": true,
    "badge": "Top Rated"
  },
  {
    "id": "v3",
    "type": "online",
    "name": "AgriBazaar Direct (Online)",
    "distance": "Delivery in 2 Days",
    "productName": "Organic Neem Oil Extractor",
    "price": "₹299 / 250ml",
    "url": "https://www.agribazaar.com",
    "inStock": true,
    "badge": "2% Affiliate Commision"
  }
];

export default function VendorDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/30 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(16,185,129,0.3)] animate-slide-up"
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">Procure Treatment</h2>
              <p className="text-xs text-slate-400 mt-1">Recommended agro-dealers for your diagnosis.</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-full transition-colors border border-slate-700/50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-6 scrollbar-hide">
            {vendors.map(vendor => (
              <div 
                key={vendor.id} 
                className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 hover:border-emerald-500/40 transition-colors shadow-lg relative overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm z-10">
                  {vendor.badge}
                </div>

                <div className="flex items-start gap-3 mb-3 relative z-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    {vendor.type === 'physical' ? <Store size={18} /> : <ShoppingCart size={18} />}
                  </div>
                  <div className="pt-1">
                    <h3 className="text-white font-bold text-sm">{vendor.name}</h3>
                    <div className="flex items-center text-xs text-slate-400 mt-1 gap-1">
                      {vendor.type === 'physical' && <MapPin size={12} className="text-emerald-500" />}
                      <span>{vendor.distance}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 mb-4 border border-slate-700/30">
                  <p className="text-sm font-medium text-emerald-300 mb-1">{vendor.productName}</p>
                  <p className="text-lg font-bold text-white">{vendor.price}</p>
                </div>

                {vendor.type === 'physical' ? (
                  <a 
                    href={`tel:${vendor.contact}`}
                    className="flex items-center justify-center w-full gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold py-2.5 rounded-xl transition-colors border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <PhoneCall size={16} />
                    Call Vendor
                  </a>
                ) : (
                  <a 
                    href={vendor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold py-2.5 rounded-xl transition-colors border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  >
                    <ShoppingCart size={16} />
                    Buy Online
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
