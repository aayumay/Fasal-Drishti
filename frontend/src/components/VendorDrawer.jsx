import React, { useState, useEffect } from 'react';
import { X, PhoneCall, ShoppingCart, MapPin, Store, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VendorDrawer({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('your area');

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    
    // Simulate finding location and fetching vendors
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || 'Local';
            setLocationName(city);
            generateVendors(city);
          } catch {
            generateVendors('Local');
          }
        },
        () => {
          generateVendors('Local');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      generateVendors('Local');
    }
  }, [isOpen]);

  const generateVendors = (city) => {
    const dynamicVendors = [
      {
        id: "v1",
        type: "physical",
        name: `${city === 'Local' ? 'Premium' : city} Krishi Seva Kendra`,
        distance: "3.2 km",
        productName: "Blitox 50 (Copper Fungicide)",
        price: "₹450 / 500g",
        contact: "+919876543210",
        inStock: true,
        badge: "Verified Partner"
      },
      {
        id: "v2",
        type: "physical",
        name: `${city === 'Local' ? 'City' : city} Agro Center`,
        distance: "7.5 km",
        productName: "Tata Rallis Copper Oxychloride",
        price: "₹420 / 500g",
        contact: "+919876511111",
        inStock: true,
        badge: "Top Rated"
      },
      {
        id: "v3",
        type: "online",
        name: "AgriBazaar Direct (Online)",
        distance: "Delivery in 2 Days",
        productName: "Organic Neem Oil Extractor",
        price: "₹299 / 250ml",
        url: "https://www.agribazaar.com",
        inStock: true,
        badge: "Guaranteed Delivery"
      }
    ];
    
    setTimeout(() => {
      setVendors(dynamicVendors);
      setLoading(false);
    }, 800); // Simulate network delay for UX
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#F8F6F2] rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(35,66,41,0.2)] animate-slide-up relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#1C2B1E]/10 rounded-full mt-3" />
        
        <div className="p-6 pt-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '24px', color: '#1C2B1E', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {t('procure_treatment') || 'Procure Treatment'}
              </h2>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '13px', color: '#7A8A7C', marginTop: '6px' }}>
                Recommended agro-dealers near <strong className="text-[#1C2B1E]">{locationName}</strong>
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-white hover:bg-[#F0EBE1] text-[#1C2B1E] rounded-full transition-colors border border-[#1C2B1E]/5 shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 max-h-[55vh] overflow-y-auto pb-8 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 size={32} className="text-[#2F5D3A] animate-spin mb-4" />
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '13px', color: '#7A8A7C' }}>
                  Finding local dealers...
                </p>
              </div>
            ) : (
              vendors.map((vendor, idx) => (
                <div 
                  key={vendor.id} 
                  className="bg-white rounded-2xl p-4 border border-[#1C2B1E]/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Badge */}
                  <div className="absolute top-0 right-0 bg-[#2F5D3A] text-white text-[9px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10 tracking-wider uppercase">
                    {vendor.badge}
                  </div>

                  <div className="flex items-start gap-3 mb-3 relative z-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#234229]/5 flex items-center justify-center text-[#2F5D3A] flex-shrink-0">
                      {vendor.type === 'physical' ? <Store size={20} /> : <ShoppingCart size={20} />}
                    </div>
                    <div className="pt-1 min-w-0 pr-16">
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '16px', color: '#1C2B1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vendor.name}
                      </h3>
                      <div className="flex items-center text-xs mt-1 gap-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#7A8A7C', fontWeight: 500 }}>
                        {vendor.type === 'physical' && <MapPin size={12} className="text-[#2F5D3A]" />}
                        <span>{vendor.distance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8F6F2] rounded-xl p-3 mb-4 border border-[#1C2B1E]/5 flex justify-between items-center">
                    <div>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '12px', color: '#7A8A7C', fontWeight: 600, marginBottom: '2px' }}>
                        {vendor.productName}
                      </p>
                      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: '#1C2B1E' }}>
                        {vendor.price}
                      </p>
                    </div>
                  </div>

                  {vendor.type === 'physical' ? (
                    <a 
                      href={`tel:${vendor.contact}`}
                      className="flex items-center justify-center w-full gap-2 bg-[#234229] hover:bg-[#1C2B1E] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                      style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    >
                      <PhoneCall size={16} />
                      {t('call_vendor') || 'Call Vendor'}
                    </a>
                  ) : (
                    <a 
                      href={vendor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2 bg-[#D9C27A] hover:bg-[#cbb36b] text-[#1C2B1E] font-bold py-3.5 rounded-xl transition-colors shadow-sm"
                      style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    >
                      <ShoppingCart size={16} />
                      {t('buy_online') || 'Buy Online'}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
