/// <reference types="astro/client" />

type ConsoleSoundEffect =
  "hover" | "focus" | "confirm" | "back" | "toggle" | "launch" | "error";

interface ConsoleAudioController {
  play: (effect: ConsoleSoundEffect) => void;
  tone: (frequency: number, duration: number, volume?: number) => void;
  startMusic: () => void;
  stopMusic: (fadeMs?: number) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
}

interface Window {
  consoleAudio?: ConsoleAudioController;
}
