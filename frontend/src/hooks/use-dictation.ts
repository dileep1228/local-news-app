import { useEffect, useRef, useState } from 'react';

type SpeechModule = typeof import('expo-speech-recognition');

/**
 * Resolved once, at module load.
 *
 * `expo-speech-recognition` reaches for its native module the moment it is
 * imported, so a plain import throws in a dev client built before the
 * dependency existed - and being a module-level throw, it took the whole
 * compose screen down with it rather than just the mic. Requiring it behind a
 * guard keeps the rest of the screen usable until the next dev build lands.
 *
 * This can never change while the process is alive, so picking between the two
 * hooks below happens once and hook order stays stable across renders.
 */
const speech: SpeechModule | null = (() => {
  try {
    return require('expo-speech-recognition') as SpeechModule;
  } catch {
    return null;
  }
})();

export type Dictation = {
  /** False when the running dev client has no speech recognition compiled in. */
  available: boolean;
  listening: boolean;
  error: string | null;
  toggle: () => void;
};

/** Plain wording for the codes the recogniser actually reports in practice. */
function readable(code: string, detail: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Dictation is blocked. Allow the microphone and speech recognition in Settings.';
    case 'audio-capture':
      return 'No microphone available.';
    case 'network':
      return 'Dictation needs a connection right now.';
    default:
      return detail || `Dictation failed (${code})`;
  }
}

/** Appends without doubling or dropping the space between the two parts. */
function join(base: string, transcript: string): string {
  if (!transcript) return base;
  if (!base) return transcript;
  return /\s$/.test(base) ? base + transcript : `${base} ${transcript}`;
}

/**
 * Dictation for a single text field.
 *
 * The recogniser re-reports the whole spoken phrase every time it revises its
 * guess, so this remembers what was in the field when the mic was tapped and
 * appends the live transcript to that. Without it, a second burst of speech
 * would overwrite the first, and dictating after typing would erase the typing.
 */
function useLiveDictation(value: string, onChange: (text: string) => void): Dictation {
  const { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } = speech as SpeechModule;

  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** The field's contents at the moment the mic was tapped. */
  const base = useRef('');

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    onChange(join(base.current, event.results[0]?.transcript ?? ''));
  });

  useSpeechRecognitionEvent('error', (event) => {
    // "no-speech" only means the mic was tapped and nothing was said, which
    // needs no explanation.
    setError(event.error === 'no-speech' ? null : readable(event.error, event.message));
  });

  // Leaving the screen mid-sentence should not leave the mic open.
  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  async function start() {
    setError(null);

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Dictation needs microphone and speech recognition access.');
      return;
    }

    base.current = value;

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      // A post is a sentence or two with pauses in it. Without this the
      // recogniser stops at the first pause and the rest is lost.
      continuous: true,
    });
  }

  function toggle() {
    if (listening) ExpoSpeechRecognitionModule.stop();
    else start();
  }

  return { available: true, listening, error, toggle };
}

/** Same shape, does nothing - see the note on `speech` above. */
function useAbsentDictation(_value: string, _onChange: (text: string) => void): Dictation {
  return { available: false, listening: false, error: null, toggle: () => {} };
}

export const useDictation = speech ? useLiveDictation : useAbsentDictation;
