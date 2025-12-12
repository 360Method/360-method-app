import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AudioGuidance - Voice guidance component using Web Speech API
 * Provides spoken instructions for non-tech users
 *
 * Falls back to prominent text display if speech not supported
 */
export default function AudioGuidance({
  text,
  enabled = true,
  autoPlay = true,
  onComplete,
  className
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Check for speech synthesis support
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  // Speak the text
  const speak = useCallback(() => {
    if (!speechSupported || !text || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHasPlayed(true);
      onComplete?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [text, enabled, speechSupported, onComplete]);

  // Stop speaking
  const stop = useCallback(() => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [speechSupported]);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      speak();
    }
  }, [isPlaying, stop, speak]);

  // Auto-play when text changes (if enabled)
  useEffect(() => {
    if (autoPlay && enabled && text && speechSupported) {
      // Small delay to allow page to settle
      const timer = setTimeout(() => {
        speak();
      }, 500);
      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [text, autoPlay, enabled, speechSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  if (!text) return null;

  return (
    <div className={cn(
      'bg-blue-50 rounded-xl p-4 border border-blue-100',
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Play/Stop button */}
        <button
          onClick={toggle}
          disabled={!speechSupported || !enabled}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            isPlaying
              ? 'bg-blue-500 text-white animate-pulse'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            (!speechSupported || !enabled) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
        >
          {isPlaying ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm text-blue-800 leading-relaxed',
            isPlaying && 'font-medium'
          )}>
            {text}
          </p>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
            {isPlaying && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Speaking...
              </span>
            )}
            {hasPlayed && !isPlaying && enabled && (
              <button
                onClick={speak}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Replay
              </button>
            )}
            {!speechSupported && (
              <span className="text-xs text-orange-600">
                Voice guidance not available in this browser
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AudioToggle - Simple toggle button for audio on/off
 * Persists preference to localStorage
 */
export function AudioToggle({
  enabled,
  onToggle,
  className
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        enabled
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-500',
        className
      )}
      aria-label={enabled ? 'Turn off voice guidance' : 'Turn on voice guidance'}
    >
      {enabled ? (
        <>
          <Volume2 className="w-5 h-5" />
          <span className="text-sm font-medium">Voice On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-5 h-5" />
          <span className="text-sm font-medium">Voice Off</span>
        </>
      )}
    </button>
  );
}

/**
 * useAudioPreference - Hook to manage audio preference
 * Persists to localStorage
 */
export function useAudioPreference() {
  const [audioEnabled, setAudioEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('inspection-audio-enabled');
    return stored !== 'false'; // Default to true
  });

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('inspection-audio-enabled', String(newValue));
      // Cancel any ongoing speech when disabling
      if (!newValue && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return newValue;
    });
  }, []);

  return { audioEnabled, toggleAudio };
}
