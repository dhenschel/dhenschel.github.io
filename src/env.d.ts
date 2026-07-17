/// <reference types="astro/client" />

type ConsoleSoundEffect =
  | "hover"
  | "focus"
  | "navigate"
  | "boundary"
  | "confirm"
  | "back"
  | "toggle"
  | "launch"
  | "error";

type ConsoleMusicTrackId =
  "home-pulse" | "blue-hour" | "soft-orbit" | "signal-garden";
type ConsoleMusicDiscId = "shuffle" | ConsoleMusicTrackId;

type ConsoleTheme = "light" | "dark";

interface ConsoleMusicState {
  activeTrackId: ConsoleMusicTrackId;
  playbackMode: ConsoleMusicDiscId;
  defaults: Record<ConsoleTheme, ConsoleMusicDiscId>;
  enabled: boolean;
  playing: boolean;
}

interface ConsoleAudioController {
  play: (effect: ConsoleSoundEffect) => void;
  tone: (frequency: number, duration: number, volume?: number) => void;
  startMusic: () => void;
  stopMusic: (fadeMs?: number) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  getMusicState: () => ConsoleMusicState;
  setTrack: (trackId: ConsoleMusicDiscId) => void;
  setDefaultTrack: (theme: ConsoleTheme, trackId: ConsoleMusicDiscId) => void;
}

interface Window {
  consoleAudio?: ConsoleAudioController;
}

type ConsoleLanguage = "de" | "en" | "fr" | "es";
