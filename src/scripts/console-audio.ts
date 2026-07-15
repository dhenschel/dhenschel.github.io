const AUDIO_STORAGE_KEY = "dh-console-audio";
const INTERACTIVE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
// Notes are selected as a random walk at runtime, so no recorded or copied music is used.
const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25];

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let effectsGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicRunId = 0;
let musicRunning = false;
let audioUnlocked = false;
let launchInProgress = false;
let scaleIndex = 2;
let musicStep = 0;
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
  if (audioContext && masterGain && musicGain && effectsGain) {
    return audioContext;
  }

  audioContext = new window.AudioContext();
  const compressor = audioContext.createDynamicsCompressor();
  masterGain = audioContext.createGain();
  musicGain = audioContext.createGain();
  effectsGain = audioContext.createGain();

  masterGain.gain.value = 0.8;
  musicGain.gain.value = 0.0001;
  effectsGain.gain.value = 0.9;
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.22;

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

const playEffect = (effect: ConsoleSoundEffect) => {
  if (!audioEnabled) return;
  if ((effect === "hover" || effect === "focus") && !audioUnlocked) return;

  void getReadyContext().then((context) => {
    if (!context) return;

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

const playAmbientVoice = (
  context: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
) => {
  if (!musicGain) return;
  const start = context.currentTime + 0.035;
  const end = start + duration;
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const firstOscillator = context.createOscillator();
  const secondOscillator = context.createOscillator();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1350, start);
  filter.Q.value = 0.7;
  firstOscillator.type = "sine";
  secondOscillator.type = "sine";
  firstOscillator.frequency.value = frequency;
  secondOscillator.frequency.value = frequency;
  firstOscillator.detune.value = -4;
  secondOscillator.detune.value = 4;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.22);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  firstOscillator.connect(filter);
  secondOscillator.connect(filter);
  filter.connect(gain).connect(musicGain);
  firstOscillator.start(start);
  secondOscillator.start(start);
  firstOscillator.stop(end + 0.04);
  secondOscillator.stop(end + 0.04);
};

const scheduleNextMusicNote = (delay = 0) => {
  const runId = musicRunId;
  if (musicTimer !== null) window.clearTimeout(musicTimer);

  musicTimer = window.setTimeout(() => {
    if (
      runId !== musicRunId ||
      !musicRunning ||
      !audioEnabled ||
      launchInProgress ||
      document.hidden ||
      !audioContext
    ) {
      return;
    }

    const jumpOptions = [-2, -1, 1, 2];
    const jump = jumpOptions[Math.floor(Math.random() * jumpOptions.length)];
    scaleIndex =
      (scaleIndex + jump + PENTATONIC_SCALE.length) % PENTATONIC_SCALE.length;
    const frequency = PENTATONIC_SCALE[scaleIndex];

    playAmbientVoice(audioContext, frequency, 2.8, 0.105);
    if (musicStep % 4 === 0) {
      playAmbientVoice(audioContext, frequency / 2, 4.1, 0.047);
    }
    musicStep += 1;
    scheduleNextMusicNote(1650 + Math.random() * 650);
  }, delay);
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
      !musicGain
    ) {
      return;
    }

    musicRunning = true;
    const now = context.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), now);
    musicGain.gain.exponentialRampToValueAtTime(0.09, now + 1.1);
    scheduleNextMusicNote(80);
  });
};

const stopMusic = (fadeMs = 240) => {
  musicRunning = false;
  musicRunId += 1;
  if (musicTimer !== null) {
    window.clearTimeout(musicTimer);
    musicTimer = null;
  }

  if (!audioContext || !musicGain) return;
  const now = audioContext.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), now);
  musicGain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + Math.max(fadeMs / 1000, 0.02),
  );
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
