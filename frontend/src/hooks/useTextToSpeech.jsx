import { useState, useEffect, useCallback } from 'react';

export default function useTextToSpeech(langCode = 'en') {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isSupported, setIsSupported] = useState(true);

  // Map app lang code to BCP-47
  const getBcp47 = (code) => {
    switch(code) {
      case 'hi': return 'hi-IN';
      case 'gu': return 'gu-IN';
      case 'en': default: return 'en-IN'; // Or en-US fallback
    }
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    // Load voices immediately and also on change event to prevent silent failures
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text) => {
    if (!isSupported || !text) return;
    
    // Stop any ongoing speech before starting new
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = getBcp47(langCode);
    utterance.lang = targetLang;
    
    // Try to find a specific voice for the language if possible
    const voice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.startsWith(langCode));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [langCode, voices, isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  return { speak, stop, isPlaying, isPaused, isSupported };
}
