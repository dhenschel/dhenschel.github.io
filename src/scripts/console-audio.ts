const AUDIO_STORAGE_KEY = "dh-console-audio";
const INTERACTIVE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MusicScene = {
  bass: readonly [number, number];
  chord: readonly number[];
  pulsePattern: number;
};

type MotifNote = readonly [
  beat: number,
  scaleDegree: number,
  duration: number,
  velocity: number,
];

type MusicPulse = readonly [beat: number, duration: number, velocity: number];

const MUSIC_TEMPO = 98;
const MUSIC_BEAT_SECONDS = 60 / MUSIC_TEMPO;
const MUSIC_BEATS_PER_BAR = 4;
const MUSIC_BAR_SECONDS = MUSIC_BEAT_SECONDS * MUSIC_BEATS_PER_BAR;
const MUSIC_LEVEL = 0.108;
const MUSIC_LOOKAHEAD_MS = 120;
const MUSIC_SCHEDULE_AHEAD_SECONDS = 0.48;

// An original E-flat-major sound world. Short sixth, ninth and suspended chord
// impulses create a friendly interface pulse without imitating an existing tune.
const MUSIC_SCALE = [63, 65, 67, 70, 72, 75, 77] as const;
const MUSIC_SCENES: readonly MusicScene[] = [
  { bass: [39, 46], chord: [55, 58, 60, 65], pulsePattern: 0 }, // Eb6/9
  { bass: [36, 43], chord: [55, 58, 62, 63], pulsePattern: 1 }, // Cm9
  { bass: [44, 51], chord: [56, 60, 63, 67], pulsePattern: 2 }, // Abmaj9
  { bass: [46, 53], chord: [58, 60, 63, 67], pulsePattern: 3 }, // Bb13sus
  { bass: [43, 46], chord: [55, 58, 63, 65], pulsePattern: 1 }, // Eb/G
  { bass: [41, 48], chord: [56, 60, 63, 67], pulsePattern: 0 }, // Fm9
  { bass: [46, 53], chord: [58, 60, 63, 65], pulsePattern: 2 }, // Bb7sus
  { bass: [39, 46], chord: [55, 58, 60, 65], pulsePattern: 3 }, // Eb6/9
];

// Compact call-and-response gestures replace a continuous lead melody. Their
// short phrasing and deliberate rests make them feel like part of the menu UI.
const MUSIC_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [0.72, 2, 0.22, 0.82],
    [1.04, 3, 0.18, 0.62],
    [1.5, 1, 0.32, 0.7],
  ],
  [
    [2.12, 0, 0.24, 0.64],
    [2.48, 2, 0.19, 0.72],
    [2.96, 1, 0.28, 0.55],
  ],
  [
    [0.42, 4, 0.18, 0.48],
    [0.72, 3, 0.18, 0.58],
    [1.08, 2, 0.25, 0.6],
  ],
  [
    [2.36, 1, 0.21, 0.52],
    [2.68, 2, 0.18, 0.6],
    [3.04, 4, 0.24, 0.48],
  ],
  [
    [0.82, 2, 0.25, 0.52],
    [2.72, 0, 0.28, 0.46],
  ],
  [
    [3.06, 5, 0.12, 0.4],
    [3.3, 6, 0.17, 0.34],
  ],
];

const MUSIC_PULSE_PATTERNS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.62, 0.88],
    [1.72, 0.48, 0.5],
    [3, 0.55, 0.64],
  ],
  [
    [0.48, 0.48, 0.54],
    [2, 0.62, 0.76],
    [3.46, 0.36, 0.42],
  ],
  [
    [0, 0.58, 0.72],
    [2.46, 0.58, 0.66],
  ],
  [
    [0.72, 0.46, 0.48],
    [1.96, 0.58, 0.68],
    [3.22, 0.44, 0.5],
  ],
];

const MUSIC_BASS_PATTERNS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.48, 0.82],
    [2.72, 0.42, 0.54],
  ],
  [
    [0.48, 0.42, 0.54],
    [2, 0.48, 0.72],
  ],
  [
    [0, 0.45, 0.7],
    [1.72, 0.34, 0.42],
    [3.22, 0.4, 0.48],
  ],
  [
    [0.22, 0.4, 0.5],
    [2.46, 0.48, 0.66],
  ],
];

// Four complementary eight-bar arrangements create roughly 80 seconds of
// structured variation before the same distribution of gestures returns.
const MUSIC_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, 1, null, 5, 2, null, 3, 4],
  [0, null, 1, 4, 2, 3, null, 5],
  [0, 4, 2, null, 1, null, 3, 5],
  [0, 1, null, 4, 2, 5, 3, null],
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
  musicDry.gain.value = 0.96;
  musicEcho.delayTime.value = MUSIC_BEAT_SECONDS * 0.75;
  musicEchoFilter.type = "lowpass";
  musicEchoFilter.frequency.value = 1850;
  musicEchoFilter.Q.value = 0.35;
  musicEchoFeedback.gain.value = 0.04;
  musicEchoWet.gain.value = 0.038;
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

const scheduleChordPulse = (
  context: AudioContext,
  destination: AudioNode,
  notes: readonly number[],
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.32);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const fundamentalMix = context.createGain();
  const overtoneMix = context.createGain();

  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(2200, start);
  filter.frequency.exponentialRampToValueAtTime(920, end);
  fundamentalMix.gain.value = 0.76;
  overtoneMix.gain.value = 0.034;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.014);
  envelope.gain.exponentialRampToValueAtTime(level * 0.3, start + 0.13);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  fundamentalMix.connect(filter);
  overtoneMix.connect(filter);
  filter.connect(envelope).connect(destination);

  notes.forEach((note, index) => {
    const frequency = midiToFrequency(note);
    const detune = (index - (notes.length - 1) / 2) * 0.45;
    const fundamental = context.createOscillator();
    const overtone = context.createOscillator();

    fundamental.type = "triangle";
    fundamental.frequency.value = frequency;
    fundamental.detune.value = detune;
    overtone.type = "sine";
    overtone.frequency.value = frequency * 2;
    overtone.detune.value = -detune + 1.5;
    fundamental.connect(fundamentalMix);
    overtone.connect(overtoneMix);
    fundamental.start(start);
    overtone.start(start);
    fundamental.stop(end + 0.05);
    overtone.stop(end + 0.05);
  });
};

const scheduleMenuBass = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.26);
  const oscillator = context.createOscillator();
  const warmth = context.createOscillator();
  const warmthMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency * 1.018, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency, start + 0.065);
  warmth.type = "triangle";
  warmth.frequency.value = frequency * 2;
  warmthMix.gain.value = 0.07;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(680, start);
  filter.frequency.exponentialRampToValueAtTime(330, end);
  filter.Q.value = 0.6;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(level * 0.32, start + 0.12);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(filter);
  warmth.connect(warmthMix).connect(filter);
  filter.connect(envelope).connect(destination);
  oscillator.start(start);
  warmth.start(start);
  oscillator.stop(end + 0.04);
  warmth.stop(end + 0.04);
};

const scheduleMenuKey = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.28);
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
  colorMix.gain.value = 0.1;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3600, start);
  filter.frequency.exponentialRampToValueAtTime(1500, end);
  filter.Q.value = 0.72;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.009);
  envelope.gain.exponentialRampToValueAtTime(level * 0.22, start + 0.095);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  fundamental.connect(filter);
  color.connect(colorMix).connect(filter);
  filter.connect(envelope).connect(destination);
  fundamental.start(start);
  color.start(start);
  fundamental.stop(end + 0.04);
  color.stop(end + 0.04);
};

const scheduleSoftTick = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  level: number,
) => {
  const end = start + 0.055;
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(1480, start);
  oscillator.frequency.exponentialRampToValueAtTime(860, end);
  filter.type = "bandpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.9;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(filter).connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
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
  const breath = 0.98 + Math.sin((absoluteBar + 1) * 1.31) * 0.02;
  const pulsePattern = MUSIC_PULSE_PATTERNS[scene.pulsePattern];
  const bassPattern = MUSIC_BASS_PATTERNS[scene.pulsePattern];

  pulsePattern.forEach(([beat, duration, velocity]) => {
    scheduleChordPulse(
      context,
      destination,
      scene.chord,
      start + beat * MUSIC_BEAT_SECONDS,
      duration * MUSIC_BEAT_SECONDS,
      0.018 * velocity * breath,
    );
  });

  bassPattern.forEach(([beat, duration, velocity], index) => {
    scheduleMenuBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * MUSIC_BEAT_SECONDS,
      duration * MUSIC_BEAT_SECONDS,
      0.031 * velocity * breath,
    );
  });

  if (absoluteBar % 4 === 1) {
    scheduleSoftTick(
      context,
      destination,
      start + 3.48 * MUSIC_BEAT_SECONDS,
      0.0065 * breath,
    );
  } else if (absoluteBar % 4 === 3) {
    [1.48, 3.48].forEach((beat, index) =>
      scheduleSoftTick(
        context,
        destination,
        start + beat * MUSIC_BEAT_SECONDS,
        (index === 0 ? 0.0045 : 0.006) * breath,
      ),
    );
  }

  if (motifIndex === null) return;
  MUSIC_MOTIFS[motifIndex].forEach(
    ([beat, scaleDegree, duration, velocity]) => {
      scheduleMenuKey(
        context,
        destination,
        MUSIC_SCALE[scaleDegree],
        start + beat * MUSIC_BEAT_SECONDS,
        duration * MUSIC_BEAT_SECONDS + 0.08,
        0.038 * velocity * breath,
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
