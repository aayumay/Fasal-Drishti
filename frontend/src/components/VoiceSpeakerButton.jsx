import React, { useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import useTextToSpeech from '../hooks/useTextToSpeech';

export default function VoiceSpeakerButton({ text, lang = 'en', className = '' }) {
  const { speak, stop, isPlaying, isSupported } = useTextToSpeech(lang);

  // Automatically stop speech if component unmounts
  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!isSupported) return null;

  return (
    <button
      onClick={() => isPlaying ? stop() : speak(text)}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 backdrop-blur-sm ${
        isPlaying 
          ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20 hover:bg-brand-danger/20 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse' 
          : 'bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20'
      } ${className}`}
      title={isPlaying ? "Stop Reading" : "Read Aloud"}
    >
      {isPlaying ? (
        <Square size={14} className="fill-current" />
      ) : (
        <Volume2 size={14} />
      )}
    </button>
  );
}
