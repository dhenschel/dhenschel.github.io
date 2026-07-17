import {
  defaultMusicByTheme,
  isConsoleTheme,
  isMusicDiscId,
  musicTrackIds,
  normalizeShufflePool,
  shufflePoolStorageKey,
  type ConsoleTheme,
  type MusicDiscId,
  type MusicTrackId,
} from "../data/music";
import { musicCompositions, type MusicComposition } from "./music-compositions";
import { t } from "./i18n";

const AUDIO_STORAGE_KEY = "dh-console-audio";
const MUSIC_STORAGE_KEY = "dh-console-music-v1";
const INTERACTIVE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MUSIC_LOOKAHEAD_MS = 120;
const MUSIC_SCHEDULE_AHEAD_SECONDS = 0.48;
const SHUFFLE_MIN_DURATION_MS = 180_000;
const SHUFFLE_MAX_DURATION_MS = 240_000;
const SHUFFLE_FADE_DURATION_MS = 1_800;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicInput: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicDry: GainNode | null = null;
let musicEcho: DelayNode | null = null;
let musicEchoFilter: BiquadFilterNode | null = null;
let musicEchoFeedback: GainNode | null = null;
let musicEchoWet: GainNode | null = null;
let effectsGain: GainNode | null = null;
let musicTimer: number | null = null;
let shuffleAdvanceTimer: number | null = null;
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

type MusicPreferences = {
  version: 1;
  defaults: Record<ConsoleTheme, MusicDiscId>;
};

const getCurrentTheme = (): ConsoleTheme =>
  document.documentElement.dataset.consoleTheme === "dark" ? "dark" : "light";

const readMusicPreferences = (): MusicPreferences => {
  const fallback: MusicPreferences = {
    version: 1,
    defaults: { ...defaultMusicByTheme },
  };

  try {
    const stored = localStorage.getItem(MUSIC_STORAGE_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<MusicPreferences>;
    const light = parsed.defaults?.light;
    const dark = parsed.defaults?.dark;
    return {
      version: 1,
      defaults: {
        light: isMusicDiscId(light) ? light : fallback.defaults.light,
        dark: isMusicDiscId(dark) ? dark : fallback.defaults.dark,
      },
    };
  } catch {
    return fallback;
  }
};

let musicPreferences = readMusicPreferences();

const readShufflePool = (): MusicTrackId[] => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(shufflePoolStorageKey) ?? "null",
    );
    return normalizeShufflePool(stored);
  } catch {
    return [...musicTrackIds];
  }
};

const pickShuffleTrack = (
  currentTrackId?: MusicTrackId,
  previousTrackId?: MusicTrackId | null,
) => {
  const pool = readShufflePool();
  let candidates = pool.filter((trackId) => trackId !== currentTrackId);
  if (candidates.length === 0) candidates = [...pool];
  if (candidates.length > 1 && previousTrackId) {
    const withoutPrevious = candidates.filter(
      (trackId) => trackId !== previousTrackId,
    );
    if (withoutPrevious.length > 0) candidates = withoutPrevious;
  }
  return (
    candidates[Math.floor(Math.random() * candidates.length)] ??
    musicTrackIds[0]
  );
};

let playbackMode: MusicDiscId = musicPreferences.defaults[getCurrentTheme()];
let activeTrackId: MusicTrackId =
  playbackMode === "shuffle" ? pickShuffleTrack() : playbackMode;
let previousShuffleTrackId: MusicTrackId | null = null;

const getActiveComposition = (): MusicComposition =>
  musicCompositions[activeTrackId];

const getMusicState = (): ConsoleMusicState => ({
  activeTrackId,
  playbackMode,
  defaults: { ...musicPreferences.defaults },
  enabled: audioEnabled,
  playing: musicRunning,
});

const broadcastMusicState = () => {
  document.documentElement.dataset.musicTrack = activeTrackId;
  document.documentElement.dataset.musicMode = playbackMode;
  window.dispatchEvent(
    new CustomEvent<ConsoleMusicState>("console:music-state", {
      detail: getMusicState(),
    }),
  );
};

const storeMusicPreferences = () => {
  try {
    localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(musicPreferences));
  } catch {
    // Music preferences remain available for the current session.
  }
};

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
  const composition = getActiveComposition();
  const beatSeconds = 60 / composition.tempo;
  musicDry = audioContext.createGain();
  musicEcho = audioContext.createDelay(1);
  musicEchoFilter = audioContext.createBiquadFilter();
  musicEchoFeedback = audioContext.createGain();
  musicEchoWet = audioContext.createGain();
  masterGain = audioContext.createGain();
  musicInput = audioContext.createGain();
  musicGain = audioContext.createGain();
  effectsGain = audioContext.createGain();

  masterGain.gain.value = 0.8;
  musicDry.gain.value = composition.echo.dry;
  musicEcho.delayTime.value = beatSeconds * composition.echo.delayBeats;
  musicEchoFilter.type = "lowpass";
  musicEchoFilter.frequency.value = composition.echo.filterFrequency;
  musicEchoFilter.Q.value = 0.35;
  musicEchoFeedback.gain.value = composition.echo.feedback;
  musicEchoWet.gain.value = composition.echo.wet;
  musicGain.gain.value = composition.level;
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

const configureMusicGraph = (
  context: AudioContext,
  composition: MusicComposition,
) => {
  if (
    !musicDry ||
    !musicEcho ||
    !musicEchoFilter ||
    !musicEchoFeedback ||
    !musicEchoWet ||
    !musicGain
  ) {
    return;
  }

  const now = context.currentTime;
  const beatSeconds = 60 / composition.tempo;
  musicDry.gain.setTargetAtTime(composition.echo.dry, now, 0.08);
  musicEcho.delayTime.setTargetAtTime(
    beatSeconds * composition.echo.delayBeats,
    now,
    0.08,
  );
  musicEchoFilter.frequency.setTargetAtTime(
    composition.echo.filterFrequency,
    now,
    0.08,
  );
  musicEchoFeedback.gain.setTargetAtTime(composition.echo.feedback, now, 0.08);
  musicEchoWet.gain.setTargetAtTime(composition.echo.wet, now, 0.08);
  musicGain.gain.setTargetAtTime(composition.level, now, 0.08);
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
  const musicLevel = getActiveComposition().level;

  holdAudioParam(musicGain.gain, now);
  musicGain.gain.exponentialRampToValueAtTime(
    Math.max(musicLevel * depth, 0.0001),
    now + 0.025,
  );
  musicGain.gain.exponentialRampToValueAtTime(musicLevel, now + release);
};

const playEffect = (effect: ConsoleSoundEffect) => {
  if (!audioEnabled) return;
  if ((effect === "hover" || effect === "focus") && !audioUnlocked) return;

  void getReadyContext().then((context) => {
    if (!context) return;

    if (effect !== "hover") {
      const isNavigationEffect =
        effect === "focus" ||
        effect === "navigate" ||
        effect === "boundary" ||
        effect === "empty";
      const depth =
        effect === "launch"
          ? 0.36
          : effect === "empty"
            ? 0.98
            : effect === "boundary"
              ? 0.93
              : isNavigationEffect
                ? 0.82
                : 0.68;
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

    if (effect === "focus" || effect === "navigate") {
      scheduleEffectTone(context, 610, 690, 0.085, 0.028);
      return;
    }

    if (effect === "boundary") {
      scheduleEffectTone(context, 355, 315, 0.105, 0.017, 0, "sine");
      return;
    }

    if (effect === "empty") {
      scheduleEffectTone(context, 305, 286, 0.075, 0.008, 0, "sine");
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

const scheduleMusicBar = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  barIndex: number,
  phraseIndex: number,
  absoluteBar: number,
) => {
  const composition = getActiveComposition();
  const beatSeconds = 60 / composition.tempo;
  composition.scheduleBar({
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
    barSeconds: beatSeconds * 4,
  });
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
  const composition = getActiveComposition();
  const barSeconds = (60 / composition.tempo) * 4;
  while (nextMusicBarAt < scheduleUntil) {
    scheduleMusicBar(
      audioContext,
      musicBus,
      nextMusicBarAt,
      musicBarIndex,
      musicPhraseIndex,
      musicAbsoluteBar,
    );
    nextMusicBarAt += barSeconds;
    musicBarIndex += 1;
    musicAbsoluteBar += 1;

    if (musicBarIndex >= composition.barsPerPhrase) {
      musicBarIndex = 0;
      musicPhraseIndex = (musicPhraseIndex + 1) % composition.phraseCount;
    }
  }

  musicTimer = window.setTimeout(
    () => scheduleMusicWindow(runId, musicBus),
    MUSIC_LOOKAHEAD_MS,
  );
};

const clearShuffleAdvance = () => {
  if (shuffleAdvanceTimer === null) return;
  window.clearTimeout(shuffleAdvanceTimer);
  shuffleAdvanceTimer = null;
  delete document.documentElement.dataset.musicShuffleNextAt;
};

const scheduleShuffleAdvance = () => {
  clearShuffleAdvance();
  if (
    playbackMode !== "shuffle" ||
    !musicRunning ||
    !audioEnabled ||
    launchInProgress ||
    document.hidden
  ) {
    return;
  }
  const duration =
    SHUFFLE_MIN_DURATION_MS +
    Math.random() * (SHUFFLE_MAX_DURATION_MS - SHUFFLE_MIN_DURATION_MS);
  document.documentElement.dataset.musicShuffleNextAt = String(
    Date.now() + duration,
  );
  shuffleAdvanceTimer = window.setTimeout(() => {
    shuffleAdvanceTimer = null;
    if (playbackMode === "shuffle") setTrack("shuffle");
  }, duration);
};

const startMusic = (fadeInSeconds?: number) => {
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
    const composition = getActiveComposition();
    const now = context.currentTime;
    configureMusicGraph(context, composition);
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(composition.level, now);
    musicBus.gain.setValueAtTime(0.0001, now);
    musicBus.gain.exponentialRampToValueAtTime(
      1,
      now + (fadeInSeconds ?? composition.fadeInSeconds),
    );
    musicBarIndex = 0;
    musicPhraseIndex = musicStartVariant % composition.phraseCount;
    musicStartVariant = (musicStartVariant + 1) % composition.phraseCount;
    musicAbsoluteBar = musicPhraseIndex * composition.barsPerPhrase;
    nextMusicBarAt = now + 0.08;
    scheduleMusicWindow(runId, musicBus);
    broadcastMusicState();
    scheduleShuffleAdvance();
  });
};

const stopMusic = (fadeMs = 240) => {
  clearShuffleAdvance();
  musicRunning = false;
  musicRunId += 1;
  if (musicTimer !== null) {
    window.clearTimeout(musicTimer);
    musicTimer = null;
  }

  const musicBus = activeMusicBus;
  activeMusicBus = null;
  if (!audioContext || !musicBus) {
    broadcastMusicState();
    return;
  }
  const now = audioContext.currentTime;
  holdAudioParam(musicBus.gain, now);
  musicBus.gain.exponentialRampToValueAtTime(
    0.0001,
    now + Math.max(fadeMs / 1000, 0.02),
  );
  window.setTimeout(() => musicBus.disconnect(), Math.max(fadeMs + 320, 600));
  broadcastMusicState();
};

const applyActiveTrack = (
  trackId: MusicTrackId,
  transition?: { fadeInMs: number; fadeOutMs: number },
) => {
  if (activeTrackId === trackId) {
    if (!musicRunning) startMusic();
    else scheduleShuffleAdvance();
    broadcastMusicState();
    return;
  }

  stopMusic(transition?.fadeOutMs ?? 420);
  activeTrackId = trackId;
  broadcastMusicState();
  startMusic(transition ? transition.fadeInMs / 1000 : undefined);
};

const setTrack = (discId: MusicDiscId) => {
  if (!isMusicDiscId(discId)) return;
  if (discId === "shuffle") {
    const nextTrackId = pickShuffleTrack(activeTrackId, previousShuffleTrackId);
    previousShuffleTrackId = activeTrackId;
    playbackMode = "shuffle";
    applyActiveTrack(nextTrackId, {
      fadeInMs: SHUFFLE_FADE_DURATION_MS,
      fadeOutMs: SHUFFLE_FADE_DURATION_MS,
    });
    return;
  }

  playbackMode = discId;
  previousShuffleTrackId = null;
  clearShuffleAdvance();
  applyActiveTrack(discId);
};

const setDefaultTrack = (theme: ConsoleTheme, discId: MusicDiscId) => {
  if (!isConsoleTheme(theme) || !isMusicDiscId(discId)) return;
  musicPreferences = {
    version: 1,
    defaults: {
      ...musicPreferences.defaults,
      [theme]: discId,
    },
  };
  storeMusicPreferences();
  broadcastMusicState();
};

const applyThemeMusic = (theme: ConsoleTheme) => {
  if (!isConsoleTheme(theme)) return;
  setTrack(musicPreferences.defaults[theme]);
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
    audioEnabled ? t("controls.disableSound") : t("controls.enableSound"),
  );
  button.title = audioEnabled
    ? t("controls.disableSound")
    : t("controls.enableSound");
  if (label) {
    label.textContent = audioEnabled
      ? t("controls.soundOn")
      : t("controls.soundOff");
  }
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
  broadcastMusicState();
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
      item.addEventListener("pointerenter", () => {
        if (document.documentElement.dataset.gamepadNavigating === "true")
          return;
        playEffect("hover");
      });
      item.addEventListener("focus", () => {
        if (
          document.documentElement.dataset.inputMode === "gamepad" &&
          item.classList.contains("gamepad-pointer-target")
        )
          return;
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
    getMusicState,
    setTrack,
    setDefaultTrack,
  };

  updateSoundControl();
  window.addEventListener("console:language-changed", updateSoundControl);
  bindInterfaceSounds();
  broadcastMusicState();

  document
    .querySelector<HTMLButtonElement>("[data-sound-toggle]")
    ?.addEventListener("click", () => setEnabled(!audioEnabled));

  window.addEventListener("console:launch-start", () => {
    launchInProgress = true;
    stopMusic(180);
  });
  window.addEventListener("console:theme-changed", (event) => {
    const theme = (event as CustomEvent<{ theme?: string }>).detail?.theme;
    if (isConsoleTheme(theme)) applyThemeMusic(theme);
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
