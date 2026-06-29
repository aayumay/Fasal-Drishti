import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, ChevronRight } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      style={{ background: '#F8F6F2', position: 'relative' }}
    >
      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-80px',
        width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(164,196,107,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '80px', left: '-60px',
        width: '240px', height: '240px',
        background: 'radial-gradient(circle, rgba(35,66,41,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div id="recaptcha-container" />
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 flex items-center justify-center mx-auto mb-5 overflow-hidden rounded-2xl shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid rgba(35,66,41,0.08)' }}
          >
            <img src="/fasal_logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              fontSize: '32px',
              color: '#1C2B1E',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            {t('welcome_back_title')}
          </h1>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '14px', color: '#7A8A7C' }}>
            {t('login_subtitle')}
          </p>
        </div>

        {error && (
          <div
            className="text-sm p-3 rounded-xl mb-5 text-center animate-scale-in"
            style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}
          >
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label style={{ display: 'block', fontFamily: 'Manrope, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1C2B1E', marginBottom: '8px' }}>
                {t('phone_number')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '15px', fontWeight: 600, color: '#7A8A7C' }}>
                  +91
                </span>
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
                style={{ background: 'rgba(35,66,41,0.04)', border: '1px solid rgba(35,66,41,0.08)', color: '#7A8A7C' }}
              >
                {t('demo_hint_phone')}
              </p>
            </div>
            <button type="submit" disabled={loading} className="primary-btn flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> {t('sending')}</>
              ) : (
                <><span>{t('send_otp')}</span><ChevronRight size={20} strokeWidth={2.5} /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
            <div>
              <label style={{ display: 'block', fontFamily: 'Manrope, sans-serif', fontSize: '13px', fontWeight: 600, color: '#1C2B1E', marginBottom: '8px' }}>
                {t('enter_otp')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4" style={{ color: '#7A8A7C' }}>
                  <ShieldCheck size={18} />
                </span>
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
                style={{ background: 'rgba(35,66,41,0.04)', border: '1px solid rgba(35,66,41,0.08)', color: '#7A8A7C' }}
              >
                {t('demo_hint_otp')}
              </p>
              <p className="text-xs mt-4 text-center" style={{ fontFamily: 'Manrope, sans-serif', color: '#7A8A7C' }}>
                {t('otp_sent')} {phone}.{' '}
                <button type="button" onClick={() => setStep('phone')} style={{ color: '#2F5D3A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {t('change')}
                </button>
              </p>
            </div>
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? <><Loader2 size={18} className="animate-spin" /> {t('verifying')}</> : t('verify_login')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
