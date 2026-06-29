import { useNavigate } from 'react-router-dom';
import { ChevronRight, Leaf } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-hidden"
      style={{ background: '#F8F6F2' }}
    >
      {/* Subtle decorative blobs */}
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

      {/* Top logo area */}
      <div className="relative z-10 pt-16 px-8 flex items-center gap-3">
        <div
          style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(35,66,41,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img src="/fasal_logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        </div>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700, fontSize: '18px',
          color: '#234229', letterSpacing: '-0.01em',
        }}>
          Fasal-Drishti
        </span>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col px-8">
        <p style={{
          fontFamily: 'Manrope, sans-serif', fontWeight: 600,
          fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#A4C46B', marginBottom: '16px',
        }}>
          Precision Agriculture Intelligence
        </p>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700, fontSize: 'clamp(36px, 10vw, 52px)',
          color: '#1C2B1E', lineHeight: 1.1, letterSpacing: '-0.02em',
          marginBottom: '20px',
        }}>
          Know Your<br />
          <span style={{ color: '#2F5D3A', fontStyle: 'italic' }}>Fields Better.</span>
        </h1>
        <p style={{
          fontFamily: 'Manrope, sans-serif', fontSize: '15px',
          color: '#7A8A7C', fontWeight: 400, lineHeight: 1.7,
          maxWidth: '280px',
        }}>
          AI-powered satellite insights to protect your crops and maximise yield — right from your phone.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-8 pb-12 flex flex-col gap-4">
        {/* Feature pills */}
        <div className="flex gap-2 mb-2 flex-wrap">
          {['Satellite Maps', 'AI Diagnosis', 'Weather Alerts'].map(tag => (
            <span key={tag} style={{
              fontFamily: 'Manrope,sans-serif', fontWeight: 600,
              fontSize: '11px', padding: '5px 12px', borderRadius: '20px',
              background: 'rgba(35,66,41,0.06)',
              border: '1px solid rgba(35,66,41,0.1)',
              color: '#2F5D3A',
            }}>
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '16px 24px',
            background: 'linear-gradient(135deg, #234229 0%, #2F5D3A 100%)',
            color: '#F8F6F2',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '16px',
            borderRadius: '16px', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(35,66,41,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(35,66,41,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(35,66,41,0.25)'; }}
        >
          <span>Get Started</span>
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        <p style={{ textAlign: 'center', fontFamily: 'Manrope,sans-serif', fontSize: '13px', color: '#B0BDB2', fontWeight: 500 }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ color: '#2F5D3A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Splash;
