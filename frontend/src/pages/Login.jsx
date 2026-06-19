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
    <div className="flex flex-col px-6 min-h-screen pt-20 pb-10 overflow-y-auto">
      <div id="recaptcha-container" />
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 overflow-hidden p-2">
            <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <h1 className="font-serif tracking-tight text-3xl font-bold text-brand-text mb-2">Welcome Back</h1>
          <p className="text-brand-text-muted text-sm">Login with your phone number</p>
        </div>

        {error && (
          <div className="bg-brand-danger/5 border border-brand-danger/20 text-brand-danger text-sm p-3 rounded-xl mb-5 text-center animate-scale-in">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-brand-text-muted text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted font-medium">+91</span>
                <input
                  type="tel"
                  className="input-field pl-12"
                  placeholder="99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <p className="text-[10px] text-brand-text-muted mt-2 text-center bg-brand-bg py-1.5 rounded-lg border border-brand-green/20">
                <span className="font-bold text-brand-green">Demo Hint:</span> Enter <span className="font-mono">99999 99999</span> to test
              </p>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><span>Send OTP</span><ArrowRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-brand-text-muted text-sm font-medium mb-2">Enter 6-digit OTP</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-text-muted"><ShieldCheck size={18} /></span>
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
              <p className="text-[10px] text-brand-text-muted mt-2 text-center bg-brand-bg py-1.5 rounded-lg border border-brand-green/20">
                <span className="font-bold text-brand-green">Demo Hint:</span> Enter <span className="font-mono">123456</span> to test
              </p>
              <p className="text-xs text-brand-text-muted mt-4 text-center">
                OTP sent to +91 {phone}.{' '}
                <button type="button" onClick={() => setStep('phone')} className="text-brand-accent font-semibold hover:underline">Change</button>
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
