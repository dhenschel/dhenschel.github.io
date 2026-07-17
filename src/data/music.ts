export const musicTrackIds = [
  "home-pulse",
  "blue-hour",
  "collection-lounge",
  "soft-orbit",
  "signal-garden",
] as const;

export type MusicTrackId = (typeof musicTrackIds)[number];
export type MusicDiscId = "shuffle" | MusicTrackId;
export type ConsoleTheme = "light" | "dark";

export type MusicTrack = {
  id: MusicTrackId;
  translationKey: "home" | "night" | "lounge" | "orbit" | "signal";
  title: string;
  shortTitle: string;
  description: string;
  color: string;
  colorDark: string;
  label: string;
  legacy?: boolean;
};

export const shuffleDisc = {
  id: "shuffle" as const,
  title: "Shuffle",
  shortTitle: "SHUFFLE",
  description:
    "Wählt zufällig eine CD aus deinem persönlichen Pool und wechselt nach mindestens drei Minuten sanft weiter.",
  color: "#aeb6c1",
  colorDark: "#5d6875",
  label: "Zufall",
};

export const musicTracks: readonly MusicTrack[] = [
  {
    id: "home-pulse",
    translationKey: "home",
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
    translationKey: "night",
    title: "Blue Hour",
    shortTitle: "NIGHT",
    description:
      "Gedämpfte Keys, ein ruhiger tiefer Puls und zurückhaltende Motive für den Dark Mode.",
    color: "#5267c9",
    colorDark: "#26356f",
    label: "Night System",
  },
  {
    id: "collection-lounge",
    translationKey: "lounge",
    title: "Collection Lounge",
    shortTitle: "LOUNGE",
    description:
      "Leichter Lounge-Jazz mit warmem E-Piano, weichem Bass, Besen, Vibraphon und zurückhaltender Flöte.",
    color: "#c77778",
    colorDark: "#74435d",
    label: "Collection Jazz",
  },
  {
    id: "soft-orbit",
    translationKey: "orbit",
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
    translationKey: "signal",
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

export const defaultMusicByTheme: Record<ConsoleTheme, MusicDiscId> = {
  light: "home-pulse",
  dark: "blue-hour",
};

export const shufflePoolStorageKey = "dh-console-shuffle-pool-v1";

const preLoungeMusicTrackIds: readonly MusicTrackId[] = [
  "home-pulse",
  "blue-hour",
  "soft-orbit",
  "signal-garden",
];

export const normalizeShufflePool = (value: unknown): MusicTrackId[] => {
  if (!Array.isArray(value)) return [...musicTrackIds];
  const selected = musicTrackIds.filter((trackId) => value.includes(trackId));
  const previouslySelectedEverything = preLoungeMusicTrackIds.every((trackId) =>
    value.includes(trackId),
  );
  if (previouslySelectedEverything) return [...musicTrackIds];
  return selected.length >= 2 ? selected : [...musicTrackIds];
};

export const isMusicTrackId = (value: unknown): value is MusicTrackId =>
  typeof value === "string" &&
  (musicTrackIds as readonly string[]).includes(value);

export const isMusicDiscId = (value: unknown): value is MusicDiscId =>
  value === "shuffle" || isMusicTrackId(value);

export const isConsoleTheme = (value: unknown): value is ConsoleTheme =>
  value === "light" || value === "dark";
