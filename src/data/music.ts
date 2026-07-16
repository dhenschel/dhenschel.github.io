export const musicTrackIds = [
  "home-pulse",
  "blue-hour",
  "soft-orbit",
  "signal-garden",
] as const;

export type MusicTrackId = (typeof musicTrackIds)[number];
export type ConsoleTheme = "light" | "dark";

export type MusicTrack = {
  id: MusicTrackId;
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  colorDark: string;
  label: string;
  legacy?: boolean;
};

export const musicTracks: readonly MusicTrack[] = [
  {
    id: "home-pulse",
    title: "Home Pulse",
    shortTitle: "HOME",
    description:
      "Leichte Akkordimpulse, freundliche Bass-Bloops und kleine digitale Antworten.",
    color: "#36a9e8",
    colorDark: "#176ab5",
    label: "Day System",
  },
  {
    id: "blue-hour",
    title: "Blue Hour",
    shortTitle: "NIGHT",
    description:
      "Gedämpfte Keys, ein ruhiger tiefer Puls und zurückhaltende Motive für den Dark Mode.",
    color: "#5267c9",
    colorDark: "#26356f",
    label: "Night System",
  },
  {
    id: "soft-orbit",
    title: "Soft Orbit",
    shortTitle: "ORBIT",
    description:
      "Der frühere, schwebende Ansatz mit langen Flächen und ruhigen Melodiebögen.",
    color: "#72c6b4",
    colorDark: "#2f746e",
    label: "Legacy 02",
    legacy: true,
  },
  {
    id: "signal-garden",
    title: "Signal Garden",
    shortTitle: "SIGNAL",
    description:
      "Die ursprüngliche prozedurale Klangwelt mit langsam wandernden Einzeltönen.",
    color: "#e3a857",
    colorDark: "#8b5727",
    label: "Legacy 01",
    legacy: true,
  },
] as const;

export const defaultMusicByTheme: Record<ConsoleTheme, MusicTrackId> = {
  light: "home-pulse",
  dark: "blue-hour",
};

export const isMusicTrackId = (value: unknown): value is MusicTrackId =>
  typeof value === "string" &&
  (musicTrackIds as readonly string[]).includes(value);

export const isConsoleTheme = (value: unknown): value is ConsoleTheme =>
  value === "light" || value === "dark";
