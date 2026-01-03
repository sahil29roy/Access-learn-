import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';

/**
 * Text-to-Speech Component using Browser Native SpeechSynthesis API
 * 
 * CRITICAL ACCESSIBILITY FEATURE
 * Features:
 * - Uses ONLY browser-native SpeechSynthesis API (no external services)
 * - Play, pause, stop controls
 * - Voice selection (if multiple voices available)
 * - Rate and pitch controls for user preference
 * - Keyboard accessible
 * - Screen reader friendly
 */
interface TextToSpeechProps {
  text: string;
  label?: string;
  className?: string;
  showControls?: boolean;
  autoSpeak?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  label = "Read aloud",
  className,
  showControls = true,
  autoSpeak = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Prefer English voices, fallback to first available
      const englishVoice = availableVoices.find(
        (voice) => voice.lang.startsWith('en') && voice.localService
      );
      setSelectedVoice(englishVoice || availableVoices[0] || null);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-speak on mount if enabled
  useEffect(() => {
    if (autoSpeak && isSupported && text) {
      speak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeak, isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure utterance
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, selectedVoice, rate, isSupported]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!isSpeaking) {
      speak();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isSpeaking, isPaused, speak, resume, pause]);

  if (!isSupported) {
    return (
      <div
        className="text-muted-foreground text-base italic"
        role="alert"
      >
        Text-to-speech is not supported in your browser. Please try Chrome, Firefox, or Edge.
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main TTS Button */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="tts"
          onClick={togglePlayPause}
          aria-label={
            !isSpeaking
              ? `${label}: Click to read text aloud`
              : isPaused
              ? 'Resume reading'
              : 'Pause reading'
          }
          aria-pressed={isSpeaking}
          leftIcon={
            !isSpeaking ? (
              <Volume2 className="w-6 h-6" aria-hidden="true" />
            ) : isPaused ? (
              <Play className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Pause className="w-6 h-6" aria-hidden="true" />
            )
          }
        >
          {!isSpeaking ? label : isPaused ? 'Resume' : 'Pause'}
        </Button>

        {/* Stop button - only visible when speaking */}
        {isSpeaking && (
          <Button
            variant="outline"
            size="icon"
            onClick={stop}
            aria-label="Stop reading"
          >
            <Square className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Advanced Controls */}
      {showControls && (
        <div className="mt-4 p-4 bg-muted rounded-xl space-y-4">
          {/* Rate control */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="tts-rate"
              className="text-base font-bold text-foreground"
            >
              Reading Speed: {rate}x
            </label>
            <input
              id="tts-rate"
              type="range"
              min="0.5"
              max="2"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-3 rounded-full bg-border appearance-none cursor-pointer accent-primary"
              aria-valuemin={0.5}
              aria-valuemax={2}
              aria-valuenow={rate}
              aria-valuetext={`${rate} times normal speed`}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Voice selection */}
          {voices.length > 1 && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="tts-voice"
                className="text-base font-bold text-foreground"
              >
                Voice
              </label>
              <select
                id="tts-voice"
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full px-4 py-3 text-base rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 min-h-touch"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Screen reader status announcement */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {isSpeaking && !isPaused && 'Reading text aloud'}
        {isPaused && 'Reading paused'}
        {!isSpeaking && 'Ready to read'}
      </div>
    </div>
  );
};

export { TextToSpeech };
