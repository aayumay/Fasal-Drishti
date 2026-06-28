import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, Sprout, Loader2 } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.VITE_FIREBASE_API_KEY && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length < 10) { setError('Please enter a valid 10-digit phone number'); return; }
    setLoading(true);
    const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        setTimeout(() => setStep('otp'), 500);
        return;
      }
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        setTimeout(() => navigate('/home'), 500);
        return;
      }
      await window.confirmationResult.confirm(otp);
      navigate('/home');
    } catch {
      setError('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col px-6 min-h-screen pt-20 pb-10 overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #1A1F16 0%, #1E2519 60%, #1A1F16 100%)' }}
    >
      <div id="recaptcha-container" />
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-5 overflow-hidden rounded-2xl"
            style={{ background: 'rgba(107,174,85,0.12)', border: '1px solid rgba(107,174,85,0.2)' }}
          >
            <img src="/fasal_logo.png" alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-serif tracking-tight text-3xl font-bold mb-2" style={{ color: '#EEF0E8' }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: '#8A9080' }}>Sign in to your farming dashboard</p>
        </div>

        {error && (
          <div
            className="text-sm p-3 rounded-xl mb-5 text-center animate-scale-in"
            style={{ background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', color: '#E05C5C' }}
          >
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8A9080' }}>Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-semibold" style={{ color: '#8DB87A' }}>+91</span>
                <input
                  type="tel"
                  className="input-field pl-12"
                  placeholder="99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <p
                className="text-[10px] mt-2 text-center py-1.5 rounded-lg"
                style={{ background: 'rgba(107,174,85,0.08)', border: '1px solid rgba(107,174,85,0.15)', color: '#8A9080' }}
              >
                <span className="font-bold" style={{ color: '#8DB87A' }}>Demo Hint:</span> Enter <span className="font-mono">99999 99999</span> to test
              </p>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><span>Send OTP</span><ArrowRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8A9080' }}>Enter 6-digit OTP</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4" style={{ color: '#8A9080' }}><ShieldCheck size={18} /></span>
                <input
                  type="text"
                  className="input-field pl-11 tracking-[0.5em] font-mono text-center"
                  placeholder="••••••"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <p
                className="text-[10px] mt-2 text-center py-1.5 rounded-lg"
                style={{ background: 'rgba(107,174,85,0.08)', border: '1px solid rgba(107,174,85,0.15)', color: '#8A9080' }}
              >
                <span className="font-bold" style={{ color: '#8DB87A' }}>Demo Hint:</span> Enter <span className="font-mono">123456</span> to test
              </p>
              <p className="text-xs mt-4 text-center" style={{ color: '#8A9080' }}>
                OTP sent to +91 {phone}.{' '}
                <button type="button" onClick={() => setStep('phone')} className="font-semibold hover:underline" style={{ color: '#8DB87A' }}>Change</button>
              </p>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


