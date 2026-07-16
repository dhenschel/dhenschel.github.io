const AUDIO_STORAGE_KEY = "dh-console-audio";
const INTERACTIVE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MusicScene = {
  bass: number;
  pad: readonly number[];
};

type MotifNote = readonly [
  beat: number,
  scaleDegree: number,
  duration: number,
  velocity: number,
];

const MUSIC_TEMPO = 76;
const MUSIC_BEAT_SECONDS = 60 / MUSIC_TEMPO;
const MUSIC_BEATS_PER_BAR = 4;
const MUSIC_BAR_SECONDS = MUSIC_BEAT_SECONDS * MUSIC_BEATS_PER_BAR;
const MUSIC_LEVEL = 0.115;
const MUSIC_LOOKAHEAD_MS = 120;
const MUSIC_SCHEDULE_AHEAD_SECONDS = 0.48;

// An original D-major sound world: open sixths, ninths and suspended tones keep
// the harmony friendly without turning the interface atmosphere into a song.
const MUSIC_SCALE = [62, 64, 66, 69, 71, 74, 76] as const;
const MUSIC_SCENES: readonly MusicScene[] = [
  { bass: 38, pad: [50, 57, 62, 64, 66, 71] }, // D6/9
  { bass: 38, pad: [45, 50, 57, 59, 64, 66] }, // D/A, still at home
  { bass: 43, pad: [50, 55, 59, 62, 66, 69] }, // Gmaj9/D
  { bass: 43, pad: [50, 55, 57, 59, 64, 66] }, // G6/9/D
  { bass: 35, pad: [47, 54, 57, 62, 64] }, // Bm7(add11)
  { bass: 33, pad: [45, 52, 57, 59, 62, 64] }, // Asus2(add11)
  { bass: 31, pad: [43, 50, 55, 57, 59, 64] }, // G6/9
  { bass: 38, pad: [45, 50, 57, 59, 64, 66] }, // D6/9/A
];

// Small related musical gestures. Every phrase returns to motif 0, while the
// remaining cells act as restrained answers or occasional points of light.
const MUSIC_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [0.65, 2, 0.58, 0.82],
    [1.45, 1, 0.58, 0.68],
    [2.45, 0, 1.05, 0.62],
  ],
  [
    [0.8, 0, 0.58, 0.58],
    [1.65, 2, 0.58, 0.7],
    [2.75, 4, 0.88, 0.56],
  ],
  [
    [0.55, 1, 0.46, 0.54],
    [1.22, 2, 0.46, 0.62],
    [2.08, 3, 0.72, 0.66],
    [3.08, 2, 0.5, 0.48],
  ],
  [
    [1.1, 4, 0.56, 0.52],
    [1.95, 3, 0.56, 0.46],
    [2.95, 1, 0.92, 0.5],
  ],
  [
    [0.9, 0, 0.72, 0.52],
    [2.45, 1, 0.72, 0.46],
  ],
  [
    [1.55, 5, 0.38, 0.4],
    [2.28, 4, 0.52, 0.44],
  ],
];

// Four complementary eight-bar arrangements create a cycle of roughly two
// minutes before the same distribution of motifs returns.
const MUSIC_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, 4, 2, null, 1, 4, 3, 5],
  [0, null, 3, 4, 2, null, 1, 4],
  [0, 4, null, 2, 1, 5, 3, null],
  [0, null, 2, 5, 1, 4, null, 3],
];

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicInput: GainNode | null = null;
let musicGain: GainNode | null = null;
let effectsGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicRunId = 0;
let musicRunning = false;
let audioUnlocked = false;
let launchInProgress = false;
let activeMusicBus: GainNode | null = null;
let nextMusicBarAt = 0;
let musicBarIndex = 0;
let musicPhraseIndex = 0;
let musicAbsoluteBar = 0;
let musicStartVariant = 0;
let lastHoverAt = 0;
let lastPointerAt = 0;

const readAudioPreference = () => {
  try {
    return localStorage.getItem(AUDIO_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

let audioEnabled = readAudioPreference();

const createAudioGraph = () => {
  if (audioContext && masterGain && musicInput && musicGain && effectsGain) {
    return audioContext;
  }

  audioContext = new window.AudioContext();
  const compressor = audioContext.createDynamicsCompressor();
  const musicDry = audioContext.createGain();
  const musicEcho = audioContext.createDelay(1);
  const musicEchoFilter = audioContext.createBiquadFilter();
  const musicEchoFeedback = audioContext.createGain();
  const musicEchoWet = audioContext.createGain();
  masterGain = audioContext.createGain();
  musicInput = audioContext.createGain();
  musicGain = audioContext.createGain();
  effectsGain = audioContext.createGain();

  masterGain.gain.value = 0.8;
  musicDry.gain.value = 0.94;
  musicEcho.delayTime.value = MUSIC_BEAT_SECONDS / 2;
  musicEchoFilter.type = "lowpass";
  musicEchoFilter.frequency.value = 1250;
  musicEchoFilter.Q.value = 0.35;
  musicEchoFeedback.gain.value = 0.075;
  musicEchoWet.gain.value = 0.055;
  musicGain.gain.value = MUSIC_LEVEL;
  effectsGain.gain.value = 0.9;
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.22;

  musicInput.connect(musicDry).connect(musicGain);
  musicInput.connect(musicEcho);
  musicEcho.connect(musicEchoFilter);
  musicEchoFilter.connect(musicEchoWet).connect(musicGain);
  musicEchoFilter.connect(musicEchoFeedback).connect(musicEcho);
  musicGain.connect(masterGain);
  effectsGain.connect(masterGain);
  masterGain.connect(compressor).connect(audioContext.destination);
  return audioContext;
};

const getReadyContext = async () => {
  if (!audioEnabled) return null;
  let context: AudioContext;

  try {
    context = createAudioGraph();
    if (context.state === "suspended") await context.resume();
  } catch {
    return null;
  }

  if (context.state !== "running") return null;
  audioUnlocked = true;
  return context;
};

const scheduleEffectTone = (
  context: AudioContext,
  frequency: number,
  endFrequency: number,
  duration: number,
  volume: number,
  offset = 0,
  type: OscillatorType = "sine",
) => {
  if (!effectsGain) return;
  const start = context.currentTime + offset;
  const end = start + duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain).connect(effectsGain);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
};

const holdAudioParam = (parameter: AudioParam, at: number) => {
  try {
    parameter.cancelAndHoldAtTime(at);
  } catch {
    const currentValue = Math.max(parameter.value, 0.0001);
    parameter.cancelScheduledValues(at);
    parameter.setValueAtTime(currentValue, at);
  }
};

const duckMusicForInterface = (
  context: AudioContext,
  depth: number,
  release: number,
) => {
  if (!musicGain || !musicRunning) return;
  const now = context.currentTime;

  holdAudioParam(musicGain.gain, now);
  musicGain.gain.exponentialRampToValueAtTime(
    Math.max(MUSIC_LEVEL * depth, 0.0001),
    now + 0.025,
  );
  musicGain.gain.exponentialRampToValueAtTime(MUSIC_LEVEL, now + release);
};

const playEffect = (effect: ConsoleSoundEffect) => {
  if (!audioEnabled) return;
  if ((effect === "hover" || effect === "focus") && !audioUnlocked) return;

  void getReadyContext().then((context) => {
    if (!context) return;

    if (effect !== "hover") {
      const depth =
        effect === "launch" ? 0.36 : effect === "focus" ? 0.82 : 0.68;
      const release = effect === "launch" ? 0.42 : 0.24;
      duckMusicForInterface(context, depth, release);
    }

    if (effect === "hover") {
      const now = performance.now();
      if (now - lastHoverAt < 55) return;
      lastHoverAt = now;
      scheduleEffectTone(context, 510, 620, 0.065, 0.026, 0, "triangle");
      return;
    }

    if (effect === "focus") {
      scheduleEffectTone(context, 610, 690, 0.085, 0.028);
      return;
    }

    if (effect === "confirm") {
      scheduleEffectTone(context, 470, 610, 0.11, 0.05, 0, "triangle");
      scheduleEffectTone(context, 720, 820, 0.12, 0.035, 0.065);
      return;
    }

    if (effect === "back") {
      scheduleEffectTone(context, 540, 340, 0.14, 0.045, 0, "triangle");
      return;
    }

    if (effect === "toggle") {
      scheduleEffectTone(context, 410, 590, 0.13, 0.045, 0, "triangle");
      scheduleEffectTone(context, 760, 910, 0.13, 0.03, 0.075);
      return;
    }

    if (effect === "launch") {
      scheduleEffectTone(context, 420, 760, 0.24, 0.08);
      scheduleEffectTone(context, 760, 980, 0.19, 0.042, 0.1);
      return;
    }

    scheduleEffectTone(context, 240, 170, 0.18, 0.055, 0, "sawtooth");
  });
};

const playTone = (frequency: number, duration: number, volume = 0.06) => {
  if (!audioEnabled) return;
  void getReadyContext().then((context) => {
    if (!context) return;
    scheduleEffectTone(context, frequency, frequency, duration, volume);
  });
};

const midiToFrequency = (note: number) => 440 * 2 ** ((note - 69) / 12);

const schedulePadChord = (
  context: AudioContext,
  destination: AudioNode,
  notes: readonly number[],
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + duration;
  const releaseAt = Math.max(start + 0.8, end - 0.8);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const fundamentalMix = context.createGain();
  const overtoneMix = context.createGain();

  filter.type = "lowpass";
  filter.Q.value = 0.55;
  filter.frequency.setValueAtTime(980, start);
  filter.frequency.exponentialRampToValueAtTime(1520, start + duration * 0.46);
  filter.frequency.exponentialRampToValueAtTime(920, end);
  fundamentalMix.gain.value = 0.72;
  overtoneMix.gain.value = 0.045;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.48);
  envelope.gain.setValueAtTime(level * 0.9, releaseAt);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  fundamentalMix.connect(filter);
  overtoneMix.connect(filter);
  filter.connect(envelope).connect(destination);

  notes.forEach((note, index) => {
    const frequency = midiToFrequency(note);
    const detune = (index - (notes.length - 1) / 2) * 0.8;
    const fundamental = context.createOscillator();
    const overtone = context.createOscillator();

    fundamental.type = "sine";
    fundamental.frequency.value = frequency;
    fundamental.detune.value = detune;
    overtone.type = "triangle";
    overtone.frequency.value = frequency * 2;
    overtone.detune.value = -detune + 2.5;
    fundamental.connect(fundamentalMix);
    overtone.connect(overtoneMix);
    fundamental.start(start);
    overtone.start(start);
    fundamental.stop(end + 0.05);
    overtone.stop(end + 0.05);
  });
};

const scheduleWarmBass = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + duration;
  const oscillator = context.createOscillator();
  const warmth = context.createOscillator();
  const warmthMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  warmth.type = "triangle";
  warmth.frequency.value = frequency * 2;
  warmthMix.gain.value = 0.055;
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.45;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.18);
  envelope.gain.setValueAtTime(level * 0.82, end - 0.55);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(filter);
  warmth.connect(warmthMix).connect(filter);
  filter.connect(envelope).connect(destination);
  oscillator.start(start);
  warmth.start(start);
  oscillator.stop(end + 0.04);
  warmth.stop(end + 0.04);
};

const scheduleSoftPluck = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.72);
  const fundamental = context.createOscillator();
  const color = context.createOscillator();
  const colorMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  fundamental.type = "sine";
  fundamental.frequency.value = frequency;
  color.type = "triangle";
  color.frequency.value = frequency * 2;
  color.detune.value = 4;
  colorMix.gain.value = 0.075;
  filter.type = "lowpass";
  filter.frequency.value = 2850;
  filter.Q.value = 0.8;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.016);
  envelope.gain.exponentialRampToValueAtTime(level * 0.3, start + 0.22);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  fundamental.connect(filter);
  color.connect(colorMix).connect(filter);
  filter.connect(envelope).connect(destination);
  fundamental.start(start);
  color.start(start);
  fundamental.stop(end + 0.04);
  color.stop(end + 0.04);
};

const scheduleMusicBar = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  barIndex: number,
  phraseIndex: number,
  absoluteBar: number,
) => {
  const scene = MUSIC_SCENES[barIndex];
  const phrase = MUSIC_PHRASES[phraseIndex];
  const motifIndex = phrase[barIndex];
  const breath = 0.965 + Math.sin((absoluteBar + 1) * 1.7) * 0.035;

  schedulePadChord(
    context,
    destination,
    scene.pad,
    start,
    MUSIC_BAR_SECONDS * 1.18,
    0.0145 * breath,
  );
  scheduleWarmBass(
    context,
    destination,
    scene.bass,
    start + 0.04,
    MUSIC_BAR_SECONDS * 0.86,
    0.027 * breath,
  );

  if (motifIndex === null) return;
  MUSIC_MOTIFS[motifIndex].forEach(
    ([beat, scaleDegree, duration, velocity]) => {
      scheduleSoftPluck(
        context,
        destination,
        MUSIC_SCALE[scaleDegree],
        start + beat * MUSIC_BEAT_SECONDS,
        duration * MUSIC_BEAT_SECONDS + 0.42,
        0.036 * velocity * breath,
      );
    },
  );
};

const scheduleMusicWindow = (runId: number, musicBus: GainNode) => {
  if (
    runId !== musicRunId ||
    musicBus !== activeMusicBus ||
    !musicRunning ||
    !audioEnabled ||
    launchInProgress ||
    document.hidden ||
    !audioContext
  ) {
    return;
  }

  const scheduleUntil = audioContext.currentTime + MUSIC_SCHEDULE_AHEAD_SECONDS;
  while (nextMusicBarAt < scheduleUntil) {
    scheduleMusicBar(
      audioContext,
      musicBus,
      nextMusicBarAt,
      musicBarIndex,
      musicPhraseIndex,
      musicAbsoluteBar,
    );
    nextMusicBarAt += MUSIC_BAR_SECONDS;
    musicBarIndex += 1;
    musicAbsoluteBar += 1;

    if (musicBarIndex >= MUSIC_SCENES.length) {
      musicBarIndex = 0;
      musicPhraseIndex = (musicPhraseIndex + 1) % MUSIC_PHRASES.length;
    }
  }

  musicTimer = window.setTimeout(
    () => scheduleMusicWindow(runId, musicBus),
    MUSIC_LOOKAHEAD_MS,
  );
};

const startMusic = () => {
  if (!audioEnabled || launchInProgress || document.hidden || musicRunning) {
    return;
  }

  const runId = ++musicRunId;
  void getReadyContext().then((context) => {
    if (
      !context ||
      runId !== musicRunId ||
      !audioEnabled ||
      launchInProgress ||
      document.hidden ||
      !musicInput ||
      !musicGain
    ) {
      return;
    }

    const musicBus = context.createGain();
    musicBus.connect(musicInput);
    activeMusicBus = musicBus;
    musicRunning = true;
    const now = context.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(MUSIC_LEVEL, now);
    musicBus.gain.setValueAtTime(0.0001, now);
    musicBus.gain.exponentialRampToValueAtTime(1, now + 1.35);
    musicBarIndex = 0;
    musicPhraseIndex = musicStartVariant % MUSIC_PHRASES.length;
    musicStartVariant = (musicStartVariant + 1) % MUSIC_PHRASES.length;
    musicAbsoluteBar = musicPhraseIndex * MUSIC_SCENES.length;
    nextMusicBarAt = now + 0.08;
    scheduleMusicWindow(runId, musicBus);
  });
};

const stopMusic = (fadeMs = 240) => {
  musicRunning = false;
  musicRunId += 1;
  if (musicTimer !== null) {
    window.clearTimeout(musicTimer);
    musicTimer = null;
  }

  const musicBus = activeMusicBus;
  activeMusicBus = null;
  if (!audioContext || !musicBus) return;
  const now = audioContext.currentTime;
  holdAudioParam(musicBus.gain, now);
  musicBus.gain.exponentialRampToValueAtTime(
    0.0001,
    now + Math.max(fadeMs / 1000, 0.02),
  );
  window.setTimeout(() => musicBus.disconnect(), Math.max(fadeMs + 320, 600));
};

const updateSoundControl = () => {
  const button = document.querySelector<HTMLButtonElement>(
    "[data-sound-toggle]",
  );
  const label = button?.querySelector<HTMLElement>("[data-sound-label]");
  document.documentElement.dataset.consoleSound = audioEnabled ? "on" : "off";
  if (!button) return;

  button.setAttribute("aria-pressed", String(audioEnabled));
  button.setAttribute(
    "aria-label",
    audioEnabled ? "Sound ausschalten" : "Sound einschalten",
  );
  button.title = audioEnabled ? "Sound ausschalten" : "Sound einschalten";
  if (label) label.textContent = audioEnabled ? "Sound an" : "Sound aus";
};

const setEnabled = (enabled: boolean) => {
  if (!enabled && audioEnabled) playEffect("back");
  audioEnabled = enabled;
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Sound preferences are optional when storage is unavailable.
  }

  updateSoundControl();
  if (!enabled) {
    stopMusic(160);
    return;
  }

  playEffect("toggle");
  startMusic();
};

const bindInterfaceSounds = () => {
  document
    .querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR)
    .forEach((item) => {
      item.addEventListener("pointerenter", () => playEffect("hover"));
      item.addEventListener("focus", () => {
        if (performance.now() - lastPointerAt > 180) playEffect("focus");
      });
    });

  document.addEventListener(
    "pointerdown",
    (event) => {
      lastPointerAt = performance.now();
      if (!audioEnabled || audioUnlocked) return;
      const target = event.target instanceof Element ? event.target : null;
      const channelLink = target?.closest<HTMLElement>("[data-channel-link]");
      const launchesWebsite = Boolean(
        channelLink && !channelLink.dataset.channelView,
      );
      void getReadyContext().then(() => {
        if (!launchesWebsite) startMusic();
      });
    },
    { capture: true },
  );

  document.addEventListener(
    "keydown",
    () => {
      if (!audioEnabled || audioUnlocked) return;
      void getReadyContext().then(() => startMusic());
    },
    { capture: true },
  );

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest<HTMLElement>(INTERACTIVE_SELECTOR);
    if (
      !control ||
      control.matches('input, textarea, button[type="submit"]') ||
      control.matches(
        "[data-channel-link], [data-start-console], [data-sound-toggle]",
      )
    ) {
      return;
    }

    if (
      control.matches(
        "[data-contact-close], [data-skip-startup], [data-console-back]",
      )
    ) {
      playEffect("back");
    } else if (
      control.matches("[data-theme-toggle], [data-fullscreen-toggle]")
    ) {
      playEffect("toggle");
    } else {
      playEffect("confirm");
    }
  });
};

export const initializeConsoleAudio = () => {
  if (window.consoleAudio) return;

  window.consoleAudio = {
    play: playEffect,
    tone: playTone,
    startMusic,
    stopMusic,
    setEnabled,
    isEnabled: () => audioEnabled,
  };

  updateSoundControl();
  bindInterfaceSounds();

  document
    .querySelector<HTMLButtonElement>("[data-sound-toggle]")
    ?.addEventListener("click", () => setEnabled(!audioEnabled));

  window.addEventListener("console:launch-start", () => {
    launchInProgress = true;
    stopMusic(180);
  });
  window.addEventListener("pageshow", () => {
    launchInProgress = false;
    if (audioUnlocked) startMusic();
  });
  window.addEventListener("pagehide", () => stopMusic(80));
  window.addEventListener("popstate", () => {
    launchInProgress = false;
    if (audioUnlocked) startMusic();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopMusic(140);
    else {
      launchInProgress = document.documentElement.dataset.launching === "true";
      if (audioUnlocked) startMusic();
    }
  });
};
