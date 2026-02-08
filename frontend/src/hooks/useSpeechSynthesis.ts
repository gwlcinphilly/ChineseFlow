import { useState, useCallback, useRef } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string, onWordBoundary?: (charIndex: number) => void) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = 'speechSynthesis' in window;

  const speak = useCallback((text: string, onWordBoundary?: (charIndex: number) => void) => {
    if (!isSupported) {
      console.error('Speech synthesis is not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Chinese language
    utterance.rate = 0.8; // Slightly slower for learning
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Word boundary callback for highlighting
    if (onWordBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onWordBoundary(event.charIndex);
        }
      };
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
