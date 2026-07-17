import type { MusicTrackId } from "../data/music";

type MusicScene = {
  bass: readonly [number, number];
  chord: readonly number[];
  pulsePattern: number;
};

type OrbitScene = {
  bass: number;
  pad: readonly number[];
};

type MotifNote = readonly [
  beat: number,
  scaleDegree: number,
  duration: number,
  velocity: number,
];

type MusicPulse = readonly [beat: number, duration: number, velocity: number];

type ScheduleBarOptions = {
  context: AudioContext;
  destination: AudioNode;
  start: number;
  barIndex: number;
  phraseIndex: number;
  absoluteBar: number;
  beatSeconds: number;
  barSeconds: number;
};

export type MusicComposition = {
  id: MusicTrackId;
  tempo: number;
  barsPerPhrase: number;
  phraseCount: number;
  level: number;
  fadeInSeconds: number;
  echo: {
    dry: number;
    delayBeats: number;
    feedback: number;
    filterFrequency: number;
    wet: number;
  };
  scheduleBar: (options: ScheduleBarOptions) => void;
};

const midiToFrequency = (note: number) => 440 * 2 ** ((note - 69) / 12);

const scheduleChordPulse = (
  context: AudioContext,
  destination: AudioNode,
  notes: readonly number[],
  start: number,
  duration: number,
  level: number,
  tone: "day" | "night" = "day",
) => {
  const end = start + Math.max(duration, tone === "night" ? 0.44 : 0.32);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const fundamentalMix = context.createGain();
  const overtoneMix = context.createGain();

  filter.type = "lowpass";
  filter.Q.value = tone === "night" ? 0.52 : 0.7;
  filter.frequency.setValueAtTime(tone === "night" ? 1450 : 2200, start);
  filter.frequency.exponentialRampToValueAtTime(
    tone === "night" ? 620 : 920,
    end,
  );
  fundamentalMix.gain.value = tone === "night" ? 0.82 : 0.76;
  overtoneMix.gain.value = tone === "night" ? 0.018 : 0.034;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(
    level,
    start + (tone === "night" ? 0.035 : 0.014),
  );
  envelope.gain.exponentialRampToValueAtTime(
    level * (tone === "night" ? 0.42 : 0.3),
    start + (tone === "night" ? 0.2 : 0.13),
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  fundamentalMix.connect(filter);
  overtoneMix.connect(filter);
  filter.connect(envelope).connect(destination);

  notes.forEach((note, index) => {
    const frequency = midiToFrequency(note);
    const detune = (index - (notes.length - 1) / 2) * 0.45;
    const fundamental = context.createOscillator();
    const overtone = context.createOscillator();

    fundamental.type = tone === "night" ? "sine" : "triangle";
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
  tone: "day" | "night" = "day",
) => {
  const end = start + Math.max(duration, tone === "night" ? 0.38 : 0.26);
  const oscillator = context.createOscillator();
  const warmth = context.createOscillator();
  const warmthMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(
    frequency * (tone === "night" ? 1.008 : 1.018),
    start,
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency,
    start + (tone === "night" ? 0.1 : 0.065),
  );
  warmth.type = "triangle";
  warmth.frequency.value = frequency * 2;
  warmthMix.gain.value = tone === "night" ? 0.035 : 0.07;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone === "night" ? 470 : 680, start);
  filter.frequency.exponentialRampToValueAtTime(
    tone === "night" ? 250 : 330,
    end,
  );
  filter.Q.value = tone === "night" ? 0.42 : 0.6;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(
    level,
    start + (tone === "night" ? 0.025 : 0.012),
  );
  envelope.gain.exponentialRampToValueAtTime(
    level * (tone === "night" ? 0.46 : 0.32),
    start + (tone === "night" ? 0.18 : 0.12),
  );
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
  tone: "day" | "night" = "day",
) => {
  const end = start + Math.max(duration, tone === "night" ? 0.42 : 0.28);
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
  color.detune.value = tone === "night" ? 1.5 : 4;
  colorMix.gain.value = tone === "night" ? 0.035 : 0.1;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(tone === "night" ? 1850 : 3600, start);
  filter.frequency.exponentialRampToValueAtTime(
    tone === "night" ? 820 : 1500,
    end,
  );
  filter.Q.value = tone === "night" ? 0.46 : 0.72;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(
    level,
    start + (tone === "night" ? 0.025 : 0.009),
  );
  envelope.gain.exponentialRampToValueAtTime(
    level * (tone === "night" ? 0.32 : 0.22),
    start + (tone === "night" ? 0.16 : 0.095),
  );
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

const scheduleAmbientVoice = (
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + duration;
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
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
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.22);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  firstOscillator.connect(filter);
  secondOscillator.connect(filter);
  filter.connect(envelope).connect(destination);
  firstOscillator.start(start);
  secondOscillator.start(start);
  firstOscillator.stop(end + 0.04);
  secondOscillator.stop(end + 0.04);
};

const HOME_SCALE = [63, 65, 67, 70, 72, 75, 77] as const;
const HOME_SCENES: readonly MusicScene[] = [
  { bass: [39, 46], chord: [55, 58, 60, 65], pulsePattern: 0 },
  { bass: [36, 43], chord: [55, 58, 62, 63], pulsePattern: 1 },
  { bass: [44, 51], chord: [56, 60, 63, 67], pulsePattern: 2 },
  { bass: [46, 53], chord: [58, 60, 63, 67], pulsePattern: 3 },
  { bass: [43, 46], chord: [55, 58, 63, 65], pulsePattern: 1 },
  { bass: [41, 48], chord: [56, 60, 63, 67], pulsePattern: 0 },
  { bass: [46, 53], chord: [58, 60, 63, 65], pulsePattern: 2 },
  { bass: [39, 46], chord: [55, 58, 60, 65], pulsePattern: 3 },
];
const HOME_MOTIFS: readonly (readonly MotifNote[])[] = [
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
const HOME_PULSES: readonly (readonly MusicPulse[])[] = [
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
const HOME_BASS: readonly (readonly MusicPulse[])[] = [
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
const HOME_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, 1, null, 5, 2, null, 3, 4],
  [0, null, 1, 4, 2, 3, null, 5],
  [0, 4, 2, null, 1, null, 3, 5],
  [0, 1, null, 4, 2, 5, 3, null],
];

const scheduleHomeBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
  } = options;
  const scene = HOME_SCENES[barIndex];
  const motifIndex = HOME_PHRASES[phraseIndex][barIndex];
  const breath = 0.98 + Math.sin((absoluteBar + 1) * 1.31) * 0.02;

  HOME_PULSES[scene.pulsePattern].forEach(([beat, duration, velocity]) =>
    scheduleChordPulse(
      context,
      destination,
      scene.chord,
      start + beat * beatSeconds,
      duration * beatSeconds,
      0.018 * velocity * breath,
    ),
  );
  HOME_BASS[scene.pulsePattern].forEach(([beat, duration, velocity], index) =>
    scheduleMenuBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * beatSeconds,
      duration * beatSeconds,
      0.031 * velocity * breath,
    ),
  );

  if (absoluteBar % 4 === 1) {
    scheduleSoftTick(
      context,
      destination,
      start + 3.48 * beatSeconds,
      0.0065 * breath,
    );
  } else if (absoluteBar % 4 === 3) {
    [1.48, 3.48].forEach((beat, index) =>
      scheduleSoftTick(
        context,
        destination,
        start + beat * beatSeconds,
        (index === 0 ? 0.0045 : 0.006) * breath,
      ),
    );
  }

  if (motifIndex === null) return;
  HOME_MOTIFS[motifIndex].forEach(([beat, scaleDegree, duration, velocity]) =>
    scheduleMenuKey(
      context,
      destination,
      HOME_SCALE[scaleDegree],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.08,
      0.038 * velocity * breath,
    ),
  );
};

const NIGHT_SCALE = [57, 59, 60, 64, 66, 69] as const;
const NIGHT_SCENES: readonly MusicScene[] = [
  { bass: [45, 52], chord: [55, 59, 60, 64], pulsePattern: 0 },
  { bass: [43, 48], chord: [52, 55, 59, 62], pulsePattern: 1 },
  { bass: [38, 45], chord: [54, 57, 59, 64], pulsePattern: 2 },
  { bass: [40, 47], chord: [55, 57, 59, 62], pulsePattern: 3 },
  { bass: [45, 40], chord: [55, 59, 60, 64], pulsePattern: 1 },
  { bass: [41, 48], chord: [52, 57, 59, 60], pulsePattern: 2 },
  { bass: [38, 45], chord: [54, 57, 59, 64], pulsePattern: 0 },
  { bass: [45, 52], chord: [55, 59, 60, 64], pulsePattern: 3 },
];
const NIGHT_PULSES: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.9, 0.72],
    [2.75, 0.72, 0.46],
  ],
  [
    [0.62, 0.72, 0.5],
    [2.2, 0.86, 0.68],
  ],
  [
    [0, 0.82, 0.62],
    [3.08, 0.58, 0.42],
  ],
  [
    [1.02, 0.78, 0.48],
    [2.72, 0.82, 0.6],
  ],
];
const NIGHT_BASS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.78, 0.7],
    [2.76, 0.58, 0.42],
  ],
  [
    [0.62, 0.58, 0.46],
    [2.2, 0.72, 0.62],
  ],
  [
    [0, 0.72, 0.58],
    [3.08, 0.52, 0.38],
  ],
  [
    [1.02, 0.58, 0.42],
    [2.72, 0.72, 0.55],
  ],
];
const NIGHT_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [1.08, 2, 0.34, 0.5],
    [1.62, 1, 0.3, 0.42],
  ],
  [
    [2.58, 0, 0.3, 0.42],
    [3.06, 2, 0.38, 0.48],
  ],
  [
    [0.9, 3, 0.28, 0.4],
    [1.38, 2, 0.34, 0.46],
  ],
  [
    [2.2, 1, 0.32, 0.38],
    [2.72, 0, 0.42, 0.44],
  ],
];
const NIGHT_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, null, 1, null, 2, null, 3, null],
  [0, 1, null, null, 2, null, 3, null],
  [0, null, 1, null, null, 2, 3, null],
  [0, null, null, 1, 2, null, null, 3],
];

const scheduleNightBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
  } = options;
  const scene = NIGHT_SCENES[barIndex];
  const motifIndex = NIGHT_PHRASES[phraseIndex][barIndex];
  const breath = 0.985 + Math.sin((absoluteBar + 1) * 0.79) * 0.015;

  NIGHT_PULSES[scene.pulsePattern].forEach(([beat, duration, velocity]) =>
    scheduleChordPulse(
      context,
      destination,
      scene.chord,
      start + beat * beatSeconds,
      duration * beatSeconds,
      0.017 * velocity * breath,
      "night",
    ),
  );
  NIGHT_BASS[scene.pulsePattern].forEach(([beat, duration, velocity], index) =>
    scheduleMenuBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * beatSeconds,
      duration * beatSeconds,
      0.03 * velocity * breath,
      "night",
    ),
  );

  if (motifIndex === null) return;
  NIGHT_MOTIFS[motifIndex].forEach(([beat, scaleDegree, duration, velocity]) =>
    scheduleMenuKey(
      context,
      destination,
      NIGHT_SCALE[scaleDegree],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.16,
      0.029 * velocity * breath,
      "night",
    ),
  );
};

const ORBIT_SCALE = [62, 64, 66, 69, 71, 74, 76] as const;
const ORBIT_SCENES: readonly OrbitScene[] = [
  { bass: 38, pad: [50, 57, 62, 64, 66, 71] },
  { bass: 38, pad: [45, 50, 57, 59, 64, 66] },
  { bass: 43, pad: [50, 55, 59, 62, 66, 69] },
  { bass: 43, pad: [50, 55, 57, 59, 64, 66] },
  { bass: 35, pad: [47, 54, 57, 62, 64] },
  { bass: 33, pad: [45, 52, 57, 59, 62, 64] },
  { bass: 31, pad: [43, 50, 55, 57, 59, 64] },
  { bass: 38, pad: [45, 50, 57, 59, 64, 66] },
];
const ORBIT_MOTIFS: readonly (readonly MotifNote[])[] = [
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
const ORBIT_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, 4, 2, null, 1, 4, 3, 5],
  [0, null, 3, 4, 2, null, 1, 4],
  [0, 4, null, 2, 1, 5, 3, null],
  [0, null, 2, 5, 1, 4, null, 3],
];

const scheduleOrbitBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
    barSeconds,
  } = options;
  const scene = ORBIT_SCENES[barIndex];
  const motifIndex = ORBIT_PHRASES[phraseIndex][barIndex];
  const breath = 0.965 + Math.sin((absoluteBar + 1) * 1.7) * 0.035;

  schedulePadChord(
    context,
    destination,
    scene.pad,
    start,
    barSeconds * 1.18,
    0.0145 * breath,
  );
  scheduleWarmBass(
    context,
    destination,
    scene.bass,
    start + 0.04,
    barSeconds * 0.86,
    0.027 * breath,
  );
  if (motifIndex === null) return;
  ORBIT_MOTIFS[motifIndex].forEach(([beat, scaleDegree, duration, velocity]) =>
    scheduleSoftPluck(
      context,
      destination,
      ORBIT_SCALE[scaleDegree],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.42,
      0.036 * velocity * breath,
    ),
  );
};

const SIGNAL_SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25] as const;
const SIGNAL_WALK = [2, 3, 1, 2, 4, 3, 5, 3, 1, 0, 2, 4] as const;

const scheduleSignalBar = (options: ScheduleBarOptions) => {
  const { context, destination, start, absoluteBar, barSeconds } = options;
  const frequency = SIGNAL_SCALE[SIGNAL_WALK[absoluteBar % SIGNAL_WALK.length]];
  scheduleAmbientVoice(
    context,
    destination,
    frequency,
    start + 0.035,
    Math.max(2.8, barSeconds * 1.26),
    0.09,
  );
  if (absoluteBar % 4 === 0) {
    scheduleAmbientVoice(
      context,
      destination,
      frequency / 2,
      start + 0.035,
      Math.max(4.1, barSeconds * 1.8),
      0.04,
    );
  }
};

export const musicCompositions: Record<MusicTrackId, MusicComposition> = {
  "home-pulse": {
    id: "home-pulse",
    tempo: 98,
    barsPerPhrase: 8,
    phraseCount: HOME_PHRASES.length,
    level: 0.118,
    fadeInSeconds: 0.9,
    echo: {
      dry: 0.96,
      delayBeats: 0.75,
      feedback: 0.04,
      filterFrequency: 1850,
      wet: 0.038,
    },
    scheduleBar: scheduleHomeBar,
  },
  "blue-hour": {
    id: "blue-hour",
    tempo: 90,
    barsPerPhrase: 8,
    phraseCount: NIGHT_PHRASES.length,
    level: 0.138,
    fadeInSeconds: 1.05,
    echo: {
      dry: 0.97,
      delayBeats: 0.5,
      feedback: 0.025,
      filterFrequency: 1120,
      wet: 0.03,
    },
    scheduleBar: scheduleNightBar,
  },
  "soft-orbit": {
    id: "soft-orbit",
    tempo: 76,
    barsPerPhrase: 8,
    phraseCount: ORBIT_PHRASES.length,
    level: 0.116,
    fadeInSeconds: 1.35,
    echo: {
      dry: 0.94,
      delayBeats: 0.5,
      feedback: 0.075,
      filterFrequency: 1250,
      wet: 0.055,
    },
    scheduleBar: scheduleOrbitBar,
  },
  "signal-garden": {
    id: "signal-garden",
    tempo: 116,
    barsPerPhrase: SIGNAL_WALK.length,
    phraseCount: 1,
    level: 0.1,
    fadeInSeconds: 1.1,
    echo: {
      dry: 0.98,
      delayBeats: 0.75,
      feedback: 0.02,
      filterFrequency: 1000,
      wet: 0.024,
    },
    scheduleBar: scheduleSignalBar,
  },
};
