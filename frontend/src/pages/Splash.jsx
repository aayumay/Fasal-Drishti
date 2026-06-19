import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sprout } from 'lucide-react';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-brand-bg to-white">
      {/* Decorative Background */}
      <div className="absolute top-20 right-[-60px] w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-[-40px] w-36 h-36 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Section */}
      <div className="relative z-10 pt-20 px-8 flex flex-col items-center text-center">
        <div className="w-28 h-28 flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-500 overflow-hidden">
          <img src="/fasal_logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <h1 className="font-serif tracking-tight text-4xl font-bold tracking-tight text-brand-text">
          Fasal-Drishti
        </h1>
        <p className="text-brand-text-muted text-sm mt-2 font-medium tracking-wide">
          Smart Vision for Healthy Farms
        </p>
      </div>

      {/* Middle Section */}
      <div className="relative z-10 flex flex-col items-start px-8 mb-8">
        <h2 className="font-serif tracking-tight text-[2.8rem] font-bold leading-[1.1] text-brand-text mb-4">
          Know Your<br />
          <span className="text-brand-accent">Fields Better.</span>
        </h2>
        <p className="text-brand-text-muted text-base leading-relaxed max-w-[280px]">
          AI-powered insights to help you protect your crops and maximize yield — right from your phone.
        </p>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex flex-col gap-4 px-8 pb-10">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-between px-6"
        >
          <span className="flex-1 text-center text-lg">Get Started</span>
          <ChevronRight size={22} className="text-white/80" />
        </button>
        <p className="text-center text-sm text-brand-text-muted">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-brand-accent font-semibold hover:underline ml-1">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Splash;
