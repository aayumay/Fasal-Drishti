import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, MapPin, Map, Sprout, Combine, ArrowLeft, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useUserContext } from '../context/UserContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { saveUserName } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', village: '', state: '', cropType: 'Soybean', farmSize: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'farmers', user.uid), { ...formData, phone: user.phoneNumber, createdAt: new Date().toISOString() });
      }
    } catch (err) {
      console.warn("Firebase save failed:", err);
    } finally {
      saveUserName(formData.name || 'Farmer');
      setLoading(false);
      navigate('/home');
    }
  };

  return (
    <div className="flex flex-col px-6 pt-14 pb-8 h-full overflow-y-auto">
      <button onClick={() => navigate(-1)} className="w-11 h-11 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:shadow-md transition-all mb-6">
        <ArrowLeft size={20} />
      </button>
      <div className="mb-8">
        <h1 className="font-serif tracking-tight text-3xl font-bold text-brand-text mb-2">Create Profile</h1>
        <p className="text-brand-text-muted text-sm leading-relaxed">Tell us about yourself and your farm to get personalized insights.</p>
      </div>
      <form onSubmit={handleSaveProfile} className="space-y-5 flex-1 flex flex-col">
        <div>
          <label className="block text-brand-text-muted text-sm font-medium mb-1.5">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><User size={18} /></span>
            <input type="text" name="name" required className="input-field pl-11" placeholder="Rohit Kumar" value={formData.name} onChange={handleChange} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-brand-text-muted text-sm font-medium mb-1.5">Village</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><MapPin size={18} /></span>
              <input type="text" name="village" required className="input-field pl-11" placeholder="Village Name" value={formData.village} onChange={handleChange} />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-brand-text-muted text-sm font-medium mb-1.5">State</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><Map size={18} /></span>
              <select name="state" required className="input-field pl-11 appearance-none" value={formData.state} onChange={handleChange}>
                <option value="">Select</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-brand-text-muted text-sm font-medium mb-1.5">Primary Crop</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><Sprout size={18} /></span>
            <select name="cropType" className="input-field pl-11 appearance-none" value={formData.cropType} onChange={handleChange}>
              <option>Soybean</option><option>Cotton</option><option>Wheat</option><option>Rice</option><option>Tomato</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-brand-text-muted text-sm font-medium mb-1.5">Farm Size (Acres)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><Combine size={18} /></span>
            <input type="number" name="farmSize" step="0.1" required className="input-field pl-11" placeholder="5.0" value={formData.farmSize} onChange={handleChange} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="primary-btn mt-auto mb-4">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><span>Complete Setup</span><ChevronRight size={20} /></>}
        </button>
      </form>
    </div>
  );
}
