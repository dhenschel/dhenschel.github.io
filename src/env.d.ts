/// <reference types="astro/client" />

type ConsoleSoundEffect =
  "hover" | "focus" | "confirm" | "back" | "toggle" | "launch" | "error";

type ConsoleMusicTrackId =
  "home-pulse" | "blue-hour" | "soft-orbit" | "signal-garden";

type ConsoleTheme = "light" | "dark";

interface ConsoleMusicState {
  activeTrackId: ConsoleMusicTrackId;
  defaults: Record<ConsoleTheme, ConsoleMusicTrackId>;
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
  setTrack: (trackId: ConsoleMusicTrackId) => void;
  setDefaultTrack: (theme: ConsoleTheme, trackId: ConsoleMusicTrackId) => void;
}

interface Window {
  consoleAudio?: ConsoleAudioController;
}
