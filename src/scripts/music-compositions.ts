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

type LoungeScene = {
  bass: readonly [number, number, number];
  chord: readonly number[];
  compPattern: number;
};

type DriftScene = {
  bass: readonly number[];
  chord: readonly number[];
  groovePattern: number;
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

const scheduleElectricPianoChord = (
  context: AudioContext,
  destination: AudioNode,
  notes: readonly number[],
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 1.05);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const fundamentalMix = context.createGain();
  const warmthMix = context.createGain();
  const tineMix = context.createGain();

  filter.type = "lowpass";
  filter.Q.value = 0.58;
  filter.frequency.setValueAtTime(4300, start);
  filter.frequency.exponentialRampToValueAtTime(1750, end);
  fundamentalMix.gain.value = 0.7;
  warmthMix.gain.value = 0.07;
  tineMix.gain.value = 0.018;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.014);
  envelope.gain.exponentialRampToValueAtTime(level * 0.38, start + 0.24);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  fundamentalMix.connect(filter);
  warmthMix.connect(filter);
  tineMix.connect(filter);
  filter.connect(envelope).connect(destination);

  notes.forEach((note, index) => {
    const frequency = midiToFrequency(note);
    const detune = (index - (notes.length - 1) / 2) * 0.38;
    const fundamental = context.createOscillator();
    const warmth = context.createOscillator();
    const tine = context.createOscillator();

    fundamental.type = "sine";
    fundamental.frequency.value = frequency;
    fundamental.detune.value = detune;
    warmth.type = "triangle";
    warmth.frequency.value = frequency * 2;
    warmth.detune.value = -detune;
    tine.type = "sine";
    tine.frequency.value = frequency * 3;
    tine.detune.value = 2.5 - detune;
    fundamental.connect(fundamentalMix);
    warmth.connect(warmthMix);
    tine.connect(tineMix);
    fundamental.start(start);
    warmth.start(start);
    tine.start(start);
    fundamental.stop(end + 0.04);
    warmth.stop(end + 0.04);
    tine.stop(end + 0.04);
  });
};

const scheduleElectricBass = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.42);
  const fundamental = context.createOscillator();
  const fingerTone = context.createOscillator();
  const fingerMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  fundamental.type = "sine";
  fundamental.frequency.setValueAtTime(frequency * 1.012, start);
  fundamental.frequency.exponentialRampToValueAtTime(frequency, start + 0.08);
  fingerTone.type = "triangle";
  fingerTone.frequency.value = frequency * 2;
  fingerMix.gain.value = 0.055;
  filter.type = "lowpass";
  filter.Q.value = 0.55;
  filter.frequency.setValueAtTime(720, start);
  filter.frequency.exponentialRampToValueAtTime(290, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.018);
  envelope.gain.exponentialRampToValueAtTime(level * 0.52, start + 0.2);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  fundamental.connect(filter);
  fingerTone.connect(fingerMix).connect(filter);
  filter.connect(envelope).connect(destination);
  fundamental.start(start);
  fingerTone.start(start);
  fundamental.stop(end + 0.04);
  fingerTone.stop(end + 0.04);
};

const brushNoiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

const getBrushNoiseBuffer = (context: AudioContext) => {
  const cached = brushNoiseBuffers.get(context);
  if (cached) return cached;
  const duration = 1.2;
  const length = Math.max(1, Math.ceil(context.sampleRate * duration));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  brushNoiseBuffers.set(context, buffer);
  return buffer;
};

const scheduleBrushSweep = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + duration;
  const source = context.createBufferSource();
  const highpass = context.createBiquadFilter();
  const bandpass = context.createBiquadFilter();
  const envelope = context.createGain();

  source.buffer = getBrushNoiseBuffer(context);
  highpass.type = "highpass";
  highpass.frequency.value = 820;
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(2900, start);
  bandpass.frequency.exponentialRampToValueAtTime(1850, end);
  bandpass.Q.value = 0.5;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.022);
  envelope.gain.exponentialRampToValueAtTime(
    level * 0.36,
    start + duration * 0.46,
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  source
    .connect(highpass)
    .connect(bandpass)
    .connect(envelope)
    .connect(destination);
  const offsetRange = Math.max(0, source.buffer.duration - duration - 0.04);
  source.start(start, Math.random() * offsetRange);
  source.stop(end + 0.03);
};

const scheduleSoftKick = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  level: number,
) => {
  const end = start + 0.16;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(92, start);
  oscillator.frequency.exponentialRampToValueAtTime(54, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
};

const scheduleVibraphone = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 1.15);
  const fundamental = context.createOscillator();
  const overtone = context.createOscillator();
  const overtoneMix = context.createGain();
  const tremolo = context.createGain();
  const tremoloOscillator = context.createOscillator();
  const tremoloDepth = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  fundamental.type = "sine";
  fundamental.frequency.value = frequency;
  overtone.type = "sine";
  overtone.frequency.value = frequency * 4;
  overtoneMix.gain.value = 0.095;
  tremolo.gain.value = 0.84;
  tremoloOscillator.type = "sine";
  tremoloOscillator.frequency.value = 5.15;
  tremoloDepth.gain.value = 0.16;
  filter.type = "lowpass";
  filter.frequency.value = 5100;
  filter.Q.value = 0.42;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.012);
  envelope.gain.exponentialRampToValueAtTime(level * 0.44, start + 0.38);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  fundamental.connect(tremolo);
  overtone.connect(overtoneMix).connect(tremolo);
  tremoloOscillator.connect(tremoloDepth).connect(tremolo.gain);
  tremolo.connect(filter).connect(envelope).connect(destination);
  fundamental.start(start);
  overtone.start(start);
  tremoloOscillator.start(start);
  fundamental.stop(end + 0.04);
  overtone.stop(end + 0.04);
  tremoloOscillator.stop(end + 0.04);
};

const scheduleSoftFlute = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.68);
  const fundamental = context.createOscillator();
  const air = context.createOscillator();
  const airMix = context.createGain();
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  fundamental.type = "sine";
  fundamental.frequency.value = frequency;
  air.type = "triangle";
  air.frequency.value = frequency * 2;
  airMix.gain.value = 0.028;
  vibrato.type = "sine";
  vibrato.frequency.value = 4.65;
  vibratoDepth.gain.value = 5.5;
  filter.type = "lowpass";
  filter.Q.value = 0.4;
  filter.frequency.value = 2750;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.13);
  envelope.gain.setValueAtTime(level * 0.88, Math.max(start + 0.2, end - 0.22));
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(fundamental.detune);
  vibratoDepth.connect(air.detune);
  fundamental.connect(filter);
  air.connect(airMix).connect(filter);
  filter.connect(envelope).connect(destination);
  fundamental.start(start);
  air.start(start);
  vibrato.start(start);
  fundamental.stop(end + 0.04);
  air.stop(end + 0.04);
  vibrato.stop(end + 0.04);
};

const scheduleDarkElectricPianoChord = (
  context: AudioContext,
  destination: AudioNode,
  notes: readonly number[],
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.82);
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const bodyMix = context.createGain();
  const colorMix = context.createGain();
  const tineMix = context.createGain();

  filter.type = "lowpass";
  filter.Q.value = 0.92;
  filter.frequency.setValueAtTime(2650, start);
  filter.frequency.exponentialRampToValueAtTime(860, end);
  bodyMix.gain.value = 0.76;
  colorMix.gain.value = 0.045;
  tineMix.gain.value = 0.01;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.018);
  envelope.gain.exponentialRampToValueAtTime(level * 0.31, start + 0.21);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  bodyMix.connect(filter);
  colorMix.connect(filter);
  tineMix.connect(filter);
  filter.connect(envelope).connect(destination);

  notes.forEach((note, index) => {
    const frequency = midiToFrequency(note);
    const detune = (index - (notes.length - 1) / 2) * 0.34;
    const body = context.createOscillator();
    const color = context.createOscillator();
    const tine = context.createOscillator();

    body.type = "sine";
    body.frequency.value = frequency;
    body.detune.value = detune;
    color.type = "triangle";
    color.frequency.value = frequency * 2;
    color.detune.value = -detune;
    tine.type = "sine";
    tine.frequency.value = frequency * 3;
    tine.detune.value = 1.8;
    body.connect(bodyMix);
    color.connect(colorMix);
    tine.connect(tineMix);
    body.start(start);
    color.start(start);
    tine.start(start);
    body.stop(end + 0.04);
    color.stop(end + 0.04);
    tine.stop(end + 0.04);
  });
};

const scheduleNeonBass = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.34);
  const sub = context.createOscillator();
  const edge = context.createOscillator();
  const edgeMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  sub.type = "sine";
  sub.frequency.setValueAtTime(frequency * 1.018, start);
  sub.frequency.exponentialRampToValueAtTime(frequency, start + 0.075);
  edge.type = "sawtooth";
  edge.frequency.value = frequency;
  edgeMix.gain.value = 0.045;
  filter.type = "lowpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(560, start);
  filter.frequency.exponentialRampToValueAtTime(185, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.016);
  envelope.gain.exponentialRampToValueAtTime(level * 0.56, start + 0.16);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  sub.connect(filter);
  edge.connect(edgeMix).connect(filter);
  filter.connect(envelope).connect(destination);
  sub.start(start);
  edge.start(start);
  sub.stop(end + 0.04);
  edge.stop(end + 0.04);
};

const scheduleNeonKick = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  level: number,
) => {
  const end = start + 0.19;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(112, start);
  oscillator.frequency.exponentialRampToValueAtTime(48, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(envelope).connect(destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
};

const scheduleMutedSnare = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  level: number,
) => {
  const duration = 0.11;
  const end = start + duration;
  const source = context.createBufferSource();
  const bandpass = context.createBiquadFilter();
  const lowpass = context.createBiquadFilter();
  const envelope = context.createGain();

  source.buffer = getBrushNoiseBuffer(context);
  bandpass.type = "bandpass";
  bandpass.frequency.value = 1420;
  bandpass.Q.value = 0.72;
  lowpass.type = "lowpass";
  lowpass.frequency.value = 3600;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.006);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  source
    .connect(bandpass)
    .connect(lowpass)
    .connect(envelope)
    .connect(destination);
  const offsetRange = Math.max(0, source.buffer.duration - duration - 0.03);
  source.start(start, Math.random() * offsetRange);
  source.stop(end + 0.02);
};

const scheduleClosedHat = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  level: number,
) => {
  const duration = 0.042;
  const end = start + duration;
  const source = context.createBufferSource();
  const highpass = context.createBiquadFilter();
  const envelope = context.createGain();

  source.buffer = getBrushNoiseBuffer(context);
  highpass.type = "highpass";
  highpass.frequency.value = 5400;
  highpass.Q.value = 0.5;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  source.connect(highpass).connect(envelope).connect(destination);
  const offsetRange = Math.max(0, source.buffer.duration - duration - 0.02);
  source.start(start, Math.random() * offsetRange);
  source.stop(end + 0.02);
};

const scheduleSoftLeadSynth = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.52);
  const fundamental = context.createOscillator();
  const glow = context.createOscillator();
  const glowMix = context.createGain();
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  fundamental.type = "triangle";
  fundamental.frequency.setValueAtTime(frequency * 0.992, start);
  fundamental.frequency.exponentialRampToValueAtTime(frequency, start + 0.09);
  glow.type = "sine";
  glow.frequency.value = frequency * 2;
  glowMix.gain.value = 0.065;
  vibrato.type = "sine";
  vibrato.frequency.value = 4.25;
  vibratoDepth.gain.value = 3.8;
  filter.type = "lowpass";
  filter.Q.value = 0.76;
  filter.frequency.setValueAtTime(2200, start);
  filter.frequency.exponentialRampToValueAtTime(1250, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.075);
  envelope.gain.setValueAtTime(
    level * 0.76,
    Math.max(start + 0.14, end - 0.18),
  );
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(fundamental.detune);
  vibratoDepth.connect(glow.detune);
  fundamental.connect(filter);
  glow.connect(glowMix).connect(filter);
  filter.connect(envelope).connect(destination);
  fundamental.start(start);
  glow.start(start);
  vibrato.start(start);
  fundamental.stop(end + 0.04);
  glow.stop(end + 0.04);
  vibrato.stop(end + 0.04);
};

const scheduleSaxLikeVoice = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.66);
  const body = context.createOscillator();
  const reed = context.createOscillator();
  const reedMix = context.createGain();
  const vibrato = context.createOscillator();
  const vibratoDepth = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  body.type = "triangle";
  body.frequency.setValueAtTime(frequency * 0.985, start);
  body.frequency.exponentialRampToValueAtTime(frequency, start + 0.11);
  reed.type = "sawtooth";
  reed.frequency.value = frequency;
  reedMix.gain.value = 0.055;
  vibrato.type = "sine";
  vibrato.frequency.value = 5.05;
  vibratoDepth.gain.value = 6.2;
  filter.type = "lowpass";
  filter.Q.value = 1.35;
  filter.frequency.setValueAtTime(2050, start);
  filter.frequency.exponentialRampToValueAtTime(1450, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.095);
  envelope.gain.setValueAtTime(level * 0.82, Math.max(start + 0.16, end - 0.2));
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(body.detune);
  vibratoDepth.connect(reed.detune);
  body.connect(filter);
  reed.connect(reedMix).connect(filter);
  filter.connect(envelope).connect(destination);
  body.start(start);
  reed.start(start);
  vibrato.start(start);
  body.stop(end + 0.04);
  reed.stop(end + 0.04);
  vibrato.stop(end + 0.04);
};

const scheduleDriftSubBass = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.38);
  const sub = context.createOscillator();
  const warmth = context.createOscillator();
  const warmthMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  sub.type = "sine";
  sub.frequency.setValueAtTime(frequency * 1.014, start);
  sub.frequency.exponentialRampToValueAtTime(frequency, start + 0.065);
  warmth.type = "triangle";
  warmth.frequency.value = frequency * 2;
  warmthMix.gain.value = 0.022;
  filter.type = "lowpass";
  filter.Q.value = 0.82;
  filter.frequency.setValueAtTime(310, start);
  filter.frequency.exponentialRampToValueAtTime(125, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.018);
  envelope.gain.exponentialRampToValueAtTime(level * 0.64, start + 0.18);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  sub.connect(filter);
  warmth.connect(warmthMix).connect(filter);
  filter.connect(envelope).connect(destination);
  sub.start(start);
  warmth.start(start);
  sub.stop(end + 0.04);
  warmth.stop(end + 0.04);
};

const scheduleAtmosphericTexture = (
  context: AudioContext,
  destination: AudioNode,
  start: number,
  duration: number,
  level: number,
  centerFrequency: number,
) => {
  const end = start + Math.max(duration, 0.72);
  const source = context.createBufferSource();
  const bandpass = context.createBiquadFilter();
  const lowpass = context.createBiquadFilter();
  const envelope = context.createGain();

  source.buffer = getBrushNoiseBuffer(context);
  source.loop = true;
  source.loopEnd = source.buffer.duration;
  source.playbackRate.value = 0.84;
  bandpass.type = "bandpass";
  bandpass.Q.value = 0.42;
  bandpass.frequency.setValueAtTime(centerFrequency * 0.74, start);
  bandpass.frequency.exponentialRampToValueAtTime(centerFrequency * 1.18, end);
  lowpass.type = "lowpass";
  lowpass.frequency.value = 3300;
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + duration * 0.3);
  envelope.gain.setValueAtTime(level * 0.86, start + duration * 0.62);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  source
    .connect(bandpass)
    .connect(lowpass)
    .connect(envelope)
    .connect(destination);
  source.start(start, Math.random() * source.buffer.duration);
  source.stop(end + 0.03);
};

const scheduleDriftSynthMotif = (
  context: AudioContext,
  destination: AudioNode,
  note: number,
  start: number,
  duration: number,
  level: number,
) => {
  const end = start + Math.max(duration, 0.3);
  const body = context.createOscillator();
  const shimmer = context.createOscillator();
  const shimmerMix = context.createGain();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const frequency = midiToFrequency(note);

  body.type = "triangle";
  body.frequency.setValueAtTime(frequency * 0.994, start);
  body.frequency.exponentialRampToValueAtTime(frequency, start + 0.055);
  shimmer.type = "sine";
  shimmer.frequency.value = frequency * 2;
  shimmerMix.gain.value = 0.075;
  filter.type = "lowpass";
  filter.Q.value = 1.18;
  filter.frequency.setValueAtTime(2850, start);
  filter.frequency.exponentialRampToValueAtTime(920, end);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(level, start + 0.016);
  envelope.gain.exponentialRampToValueAtTime(level * 0.28, start + 0.11);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);
  body.connect(filter);
  shimmer.connect(shimmerMix).connect(filter);
  filter.connect(envelope).connect(destination);
  body.start(start);
  shimmer.start(start);
  body.stop(end + 0.04);
  shimmer.stop(end + 0.04);
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

const LOUNGE_VIBE_SCALE = [67, 69, 71, 72, 74, 76, 77, 79, 81] as const;
const LOUNGE_FLUTE_SCALE = [72, 74, 76, 77, 79, 81, 83, 84] as const;
const LOUNGE_SCENES: readonly LoungeScene[] = [
  {
    bass: [36, 43, 47],
    chord: [52, 55, 59, 62, 64],
    compPattern: 0,
  },
  {
    bass: [45, 52, 55],
    chord: [55, 59, 61, 64, 66],
    compPattern: 1,
  },
  {
    bass: [38, 45, 48],
    chord: [53, 57, 60, 64, 67],
    compPattern: 2,
  },
  {
    bass: [43, 50, 52],
    chord: [53, 57, 59, 64, 69],
    compPattern: 3,
  },
  {
    bass: [40, 47, 50],
    chord: [55, 59, 62, 66, 69],
    compPattern: 1,
  },
  {
    bass: [45, 52, 55],
    chord: [55, 59, 61, 64, 66],
    compPattern: 2,
  },
  {
    bass: [38, 45, 48],
    chord: [53, 57, 60, 64, 67],
    compPattern: 0,
  },
  {
    bass: [43, 50, 47],
    chord: [53, 57, 59, 64, 69],
    compPattern: 3,
  },
];
const LOUNGE_COMPING: readonly (readonly MusicPulse[])[] = [
  [
    [0, 1.35, 0.9],
    [2.67, 0.82, 0.5],
  ],
  [
    [0.67, 0.68, 0.46],
    [2, 0.94, 0.74],
    [3.67, 0.3, 0.32],
  ],
  [
    [0, 0.88, 0.7],
    [1.67, 0.62, 0.46],
    [3, 0.76, 0.58],
  ],
  [
    [0.34, 0.68, 0.44],
    [2.34, 0.9, 0.72],
  ],
];
const LOUNGE_BASS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.9, 0.84],
    [2, 0.62, 0.52],
    [3.34, 0.34, 0.34],
  ],
  [
    [0.34, 0.62, 0.5],
    [1.67, 0.76, 0.7],
    [3.34, 0.34, 0.36],
  ],
  [
    [0, 0.82, 0.74],
    [2.67, 0.62, 0.56],
    [3.67, 0.25, 0.28],
  ],
  [
    [0.67, 0.58, 0.46],
    [2, 0.78, 0.72],
    [3.33, 0.34, 0.34],
  ],
];
const LOUNGE_VIBE_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [0.68, 2, 0.54, 0.7],
    [1.66, 4, 0.62, 0.58],
    [3, 3, 0.78, 0.5],
  ],
  [
    [1.34, 1, 0.5, 0.5],
    [2.32, 2, 0.56, 0.62],
    [3.34, 5, 0.52, 0.46],
  ],
  [
    [0.34, 4, 0.48, 0.48],
    [1, 3, 0.48, 0.56],
    [2.67, 1, 0.82, 0.52],
  ],
  [
    [0.66, 0, 0.54, 0.46],
    [2, 2, 0.62, 0.56],
    [3, 3, 0.7, 0.5],
  ],
  [
    [1.68, 6, 0.48, 0.4],
    [2.34, 5, 0.52, 0.48],
    [3.34, 3, 0.54, 0.4],
  ],
];
const LOUNGE_FLUTE_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [1.66, 2, 0.62, 0.54],
    [2.66, 3, 0.76, 0.48],
  ],
  [
    [0.68, 4, 0.58, 0.44],
    [1.66, 3, 0.58, 0.48],
    [2.66, 1, 0.88, 0.42],
  ],
  [
    [1, 1, 0.68, 0.4],
    [2, 2, 0.62, 0.46],
  ],
  [
    [0.66, 5, 0.54, 0.36],
    [1.66, 4, 0.62, 0.42],
    [3, 2, 0.76, 0.38],
  ],
];
const LOUNGE_VIBE_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, null, 1, 4, 2, null, 3, null],
  [0, 3, null, 1, null, 4, 2, null],
  [null, 1, 3, null, 0, 4, null, 2],
  [2, null, 0, 4, null, 3, 1, null],
];
const LOUNGE_FLUTE_PHRASES: readonly (readonly (number | null)[])[] = [
  [null, null, null, 0, null, null, null, 1],
  [null, null, 2, null, null, null, 0, null],
  [null, 1, null, null, null, 2, null, null],
  [null, null, null, 3, null, null, 1, null],
];

const scheduleLoungeBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
  } = options;
  const scene = LOUNGE_SCENES[barIndex];
  const vibeMotifIndex = LOUNGE_VIBE_PHRASES[phraseIndex][barIndex];
  const fluteMotifIndex = LOUNGE_FLUTE_PHRASES[phraseIndex][barIndex];
  const breath = 0.98 + Math.sin((absoluteBar + 1) * 1.07) * 0.02;

  LOUNGE_COMPING[scene.compPattern].forEach(([beat, duration, velocity]) =>
    scheduleElectricPianoChord(
      context,
      destination,
      scene.chord,
      start + beat * beatSeconds,
      duration * beatSeconds + 0.36,
      0.0185 * velocity * breath,
    ),
  );
  LOUNGE_BASS[scene.compPattern].forEach(([beat, duration, velocity], index) =>
    scheduleElectricBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.08,
      0.032 * velocity * breath,
    ),
  );

  [1, 3].forEach((beat, index) =>
    scheduleBrushSweep(
      context,
      destination,
      start + beat * beatSeconds,
      (index === 0 ? 0.29 : 0.36) * beatSeconds,
      (index === 0 ? 0.0062 : 0.0072) * breath,
    ),
  );
  [0.67, 2.67].forEach((beat) =>
    scheduleBrushSweep(
      context,
      destination,
      start + beat * beatSeconds,
      0.15 * beatSeconds,
      0.0024 * breath,
    ),
  );
  scheduleSoftKick(context, destination, start, 0.0125 * breath);
  if (absoluteBar % 2 === 0) {
    scheduleSoftKick(
      context,
      destination,
      start + 2 * beatSeconds,
      0.007 * breath,
    );
  }

  if (vibeMotifIndex !== null) {
    LOUNGE_VIBE_MOTIFS[vibeMotifIndex].forEach(
      ([beat, scaleDegree, duration, velocity]) =>
        scheduleVibraphone(
          context,
          destination,
          LOUNGE_VIBE_SCALE[scaleDegree],
          start + beat * beatSeconds,
          duration * beatSeconds + 0.55,
          0.025 * velocity * breath,
        ),
    );
  }
  if (fluteMotifIndex !== null) {
    LOUNGE_FLUTE_MOTIFS[fluteMotifIndex].forEach(
      ([beat, scaleDegree, duration, velocity]) =>
        scheduleSoftFlute(
          context,
          destination,
          LOUNGE_FLUTE_SCALE[scaleDegree],
          start + beat * beatSeconds,
          duration * beatSeconds + 0.16,
          0.018 * velocity * breath,
        ),
    );
  }
};

const NEON_LEAD_SCALE = [66, 69, 71, 73, 76, 78, 81, 83] as const;
const NEON_SAX_SCALE = [61, 64, 66, 69, 71, 73, 76] as const;
const NEON_SCENES: readonly LoungeScene[] = [
  {
    bass: [42, 49, 52],
    chord: [57, 61, 64, 68, 71],
    compPattern: 0,
  },
  {
    bass: [38, 45, 49],
    chord: [54, 57, 61, 64, 66],
    compPattern: 1,
  },
  {
    bass: [35, 42, 45],
    chord: [50, 54, 57, 61, 64],
    compPattern: 2,
  },
  {
    bass: [37, 44, 47],
    chord: [54, 59, 61, 64, 68],
    compPattern: 3,
  },
  {
    bass: [42, 49, 45],
    chord: [57, 59, 61, 64, 68, 71],
    compPattern: 1,
  },
  {
    bass: [40, 47, 51],
    chord: [56, 59, 63, 66, 68],
    compPattern: 2,
  },
  {
    bass: [38, 45, 49],
    chord: [54, 57, 61, 64, 66],
    compPattern: 0,
  },
  {
    bass: [37, 44, 40],
    chord: [53, 56, 59, 61, 64],
    compPattern: 3,
  },
];
const NEON_COMPING: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.88, 0.86],
    [1.67, 0.5, 0.46],
    [3, 0.68, 0.62],
  ],
  [
    [0.67, 0.58, 0.5],
    [2, 0.82, 0.78],
    [3.67, 0.26, 0.32],
  ],
  [
    [0, 0.72, 0.7],
    [1.34, 0.48, 0.44],
    [2.67, 0.72, 0.66],
  ],
  [
    [0.34, 0.5, 0.42],
    [1.67, 0.62, 0.58],
    [3.34, 0.42, 0.48],
  ],
];
const NEON_BASS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.68, 0.88],
    [1.67, 0.42, 0.48],
    [2.5, 0.58, 0.7],
    [3.67, 0.22, 0.34],
  ],
  [
    [0.34, 0.5, 0.52],
    [1, 0.62, 0.7],
    [2.67, 0.58, 0.76],
    [3.67, 0.22, 0.32],
  ],
  [
    [0, 0.62, 0.78],
    [1.34, 0.42, 0.46],
    [2, 0.6, 0.68],
    [3.34, 0.36, 0.42],
  ],
  [
    [0.67, 0.48, 0.52],
    [1.67, 0.48, 0.6],
    [2.67, 0.58, 0.74],
    [3.67, 0.22, 0.32],
  ],
];
const NEON_LEAD_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [0.68, 0, 0.44, 0.52],
    [1.67, 2, 0.5, 0.6],
    [3, 1, 0.62, 0.48],
  ],
  [
    [1, 3, 0.44, 0.46],
    [1.67, 4, 0.54, 0.54],
    [2.67, 2, 0.62, 0.44],
  ],
  [
    [0.34, 1, 0.4, 0.4],
    [1, 2, 0.44, 0.5],
    [2, 5, 0.58, 0.46],
  ],
  [
    [0.67, 4, 0.5, 0.42],
    [2, 3, 0.54, 0.48],
    [3.34, 1, 0.44, 0.4],
  ],
  [
    [1.34, 6, 0.4, 0.36],
    [2, 5, 0.46, 0.42],
    [3, 3, 0.52, 0.38],
  ],
];
const NEON_SAX_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [1.34, 2, 0.58, 0.48],
    [2.34, 3, 0.72, 0.44],
  ],
  [
    [0.67, 4, 0.5, 0.4],
    [1.67, 3, 0.58, 0.46],
    [3, 1, 0.72, 0.38],
  ],
  [
    [1, 1, 0.62, 0.38],
    [2, 2, 0.66, 0.44],
  ],
  [
    [0.67, 5, 0.48, 0.34],
    [1.67, 4, 0.54, 0.4],
    [2.67, 2, 0.68, 0.36],
  ],
];
const NEON_LEAD_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, null, 1, null, 2, 4, null, 3],
  [null, 2, 0, null, 3, null, 1, 4],
  [1, null, 3, 0, null, 2, 4, null],
  [0, 4, null, 2, 1, null, 3, null],
];
const NEON_SAX_PHRASES: readonly (readonly (number | null)[])[] = [
  [null, null, null, null, null, null, 0, null],
  [null, null, 1, null, null, null, null, null],
  [null, null, null, null, null, 2, null, null],
  [null, null, null, 3, null, null, null, null],
];

const scheduleNeonBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
  } = options;
  const scene = NEON_SCENES[barIndex];
  const leadMotifIndex = NEON_LEAD_PHRASES[phraseIndex][barIndex];
  const saxMotifIndex = NEON_SAX_PHRASES[phraseIndex][barIndex];
  const breath = 0.985 + Math.sin((absoluteBar + 1) * 0.91) * 0.015;

  NEON_COMPING[scene.compPattern].forEach(([beat, duration, velocity]) =>
    scheduleDarkElectricPianoChord(
      context,
      destination,
      scene.chord,
      start + beat * beatSeconds,
      duration * beatSeconds + 0.22,
      0.017 * velocity * breath,
    ),
  );
  NEON_BASS[scene.compPattern].forEach(([beat, duration, velocity], index) =>
    scheduleNeonBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.06,
      0.035 * velocity * breath,
    ),
  );

  scheduleNeonKick(context, destination, start, 0.0145 * breath);
  scheduleNeonKick(
    context,
    destination,
    start + (absoluteBar % 2 === 0 ? 2.5 : 2.67) * beatSeconds,
    0.009 * breath,
  );
  [1, 3].forEach((beat, index) =>
    scheduleMutedSnare(
      context,
      destination,
      start + beat * beatSeconds,
      (index === 0 ? 0.0052 : 0.0062) * breath,
    ),
  );
  [0, 0.67, 1, 1.67, 2, 2.67, 3, 3.67].forEach((beat, index) =>
    scheduleClosedHat(
      context,
      destination,
      start + beat * beatSeconds,
      (index % 2 === 0 ? 0.00125 : 0.0021) * breath,
    ),
  );

  if (leadMotifIndex !== null) {
    NEON_LEAD_MOTIFS[leadMotifIndex].forEach(
      ([beat, scaleDegree, duration, velocity]) =>
        scheduleSoftLeadSynth(
          context,
          destination,
          NEON_LEAD_SCALE[scaleDegree],
          start + beat * beatSeconds,
          duration * beatSeconds + 0.28,
          0.021 * velocity * breath,
        ),
    );
  }
  if (saxMotifIndex !== null) {
    NEON_SAX_MOTIFS[saxMotifIndex].forEach(
      ([beat, scaleDegree, duration, velocity]) =>
        scheduleSaxLikeVoice(
          context,
          destination,
          NEON_SAX_SCALE[scaleDegree],
          start + beat * beatSeconds,
          duration * beatSeconds + 0.18,
          0.013 * velocity * breath,
        ),
    );
  }
};

const DRIFT_SCALE = [62, 65, 67, 69, 72, 74, 77, 79] as const;
const DRIFT_SCENES: readonly DriftScene[] = [
  {
    bass: [38, 45, 48, 36],
    chord: [50, 53, 57, 60, 64],
    groovePattern: 0,
  },
  {
    bass: [34, 41, 45, 33],
    chord: [46, 50, 53, 57, 60],
    groovePattern: 1,
  },
  {
    bass: [33, 40, 45, 36],
    chord: [45, 48, 52, 55, 60],
    groovePattern: 2,
  },
  {
    bass: [36, 43, 47, 38],
    chord: [48, 52, 55, 59, 62],
    groovePattern: 3,
  },
  {
    bass: [38, 45, 41, 36],
    chord: [50, 53, 57, 60, 64],
    groovePattern: 2,
  },
  {
    bass: [31, 38, 41, 34],
    chord: [43, 46, 50, 53, 57],
    groovePattern: 1,
  },
  {
    bass: [34, 41, 45, 38],
    chord: [46, 50, 53, 57, 60],
    groovePattern: 0,
  },
  {
    bass: [33, 40, 43, 37],
    chord: [45, 50, 52, 55, 61],
    groovePattern: 3,
  },
];
const DRIFT_RHODES: readonly (readonly MusicPulse[])[] = [
  [
    [0, 1.08, 0.82],
    [1.75, 0.58, 0.46],
    [3, 0.72, 0.62],
  ],
  [
    [0.5, 0.72, 0.5],
    [2, 0.94, 0.76],
    [3.5, 0.3, 0.34],
  ],
  [
    [0, 0.82, 0.68],
    [1.5, 0.56, 0.44],
    [2.75, 0.88, 0.7],
  ],
  [
    [0.25, 0.68, 0.42],
    [1.75, 0.76, 0.6],
    [3.25, 0.5, 0.48],
  ],
];
const DRIFT_BASS: readonly (readonly MusicPulse[])[] = [
  [
    [0, 0.72, 0.9],
    [1.75, 0.44, 0.52],
    [2.5, 0.62, 0.72],
    [3.5, 0.32, 0.38],
  ],
  [
    [0, 0.54, 0.82],
    [0.75, 0.42, 0.46],
    [2.25, 0.68, 0.76],
    [3.5, 0.28, 0.4],
  ],
  [
    [0, 0.68, 0.86],
    [1.5, 0.48, 0.5],
    [2.75, 0.62, 0.74],
    [3.5, 0.28, 0.36],
  ],
  [
    [0, 0.62, 0.84],
    [0.75, 0.4, 0.44],
    [2, 0.58, 0.7],
    [3.25, 0.44, 0.5],
  ],
];
const DRIFT_KICKS: readonly (readonly number[])[] = [
  [0, 1.75, 2.5],
  [0, 0.75, 2.25, 3.5],
  [0, 1.5, 2.75],
  [0, 0.75, 2, 3.25],
];
const DRIFT_SYNTH_MOTIFS: readonly (readonly MotifNote[])[] = [
  [
    [0.75, 0, 0.28, 0.52],
    [1.25, 2, 0.24, 0.44],
    [2.75, 1, 0.34, 0.48],
  ],
  [
    [1.5, 3, 0.26, 0.46],
    [2, 4, 0.3, 0.56],
    [3.25, 2, 0.28, 0.4],
  ],
  [
    [0.5, 1, 0.24, 0.4],
    [1, 2, 0.28, 0.5],
    [2.5, 5, 0.32, 0.44],
  ],
  [
    [0.75, 4, 0.3, 0.42],
    [2.25, 3, 0.34, 0.48],
    [3.5, 1, 0.24, 0.38],
  ],
  [
    [1.25, 6, 0.22, 0.34],
    [1.75, 5, 0.26, 0.42],
    [2.75, 3, 0.3, 0.38],
  ],
];
const DRIFT_SYNTH_PHRASES: readonly (readonly (number | null)[])[] = [
  [0, null, 1, 4, 2, null, 3, null],
  [null, 2, 0, null, 3, 4, null, 1],
  [1, null, 3, 0, null, 2, 4, null],
  [0, 4, null, 2, 1, null, 3, null],
];

const scheduleDriftBar = (options: ScheduleBarOptions) => {
  const {
    context,
    destination,
    start,
    barIndex,
    phraseIndex,
    absoluteBar,
    beatSeconds,
  } = options;
  const scene = DRIFT_SCENES[barIndex];
  const synthMotifIndex = DRIFT_SYNTH_PHRASES[phraseIndex][barIndex];
  const breath = 0.98 + Math.sin((absoluteBar + 1) * 1.13) * 0.02;

  DRIFT_RHODES[scene.groovePattern].forEach(([beat, duration, velocity]) =>
    scheduleElectricPianoChord(
      context,
      destination,
      scene.chord,
      start + beat * beatSeconds,
      duration * beatSeconds + 0.3,
      0.0155 * velocity * breath,
    ),
  );
  DRIFT_BASS[scene.groovePattern].forEach(([beat, duration, velocity], index) =>
    scheduleDriftSubBass(
      context,
      destination,
      scene.bass[index % scene.bass.length],
      start + beat * beatSeconds,
      duration * beatSeconds + 0.08,
      0.036 * velocity * breath,
    ),
  );

  DRIFT_KICKS[scene.groovePattern].forEach((beat, index) =>
    scheduleNeonKick(
      context,
      destination,
      start + beat * beatSeconds,
      (index === 0 ? 0.0135 : 0.0085) * breath,
    ),
  );
  [1, 3].forEach((beat, index) =>
    scheduleMutedSnare(
      context,
      destination,
      start + beat * beatSeconds,
      (index === 0 ? 0.0045 : 0.0055) * breath,
    ),
  );
  if (scene.groovePattern === 1 || scene.groovePattern === 3) {
    scheduleMutedSnare(
      context,
      destination,
      start + 2.75 * beatSeconds,
      0.0022 * breath,
    );
  }
  [0, 0.55, 1, 1.55, 2, 2.55, 3, 3.55].forEach((beat, index) =>
    scheduleClosedHat(
      context,
      destination,
      start + beat * beatSeconds,
      (index % 2 === 0 ? 0.00105 : 0.0018) * breath,
    ),
  );

  if ([0, 2, 5, 7].includes(barIndex)) {
    const textureBeat = barIndex % 2 === 0 ? 2.35 : 0.35;
    scheduleAtmosphericTexture(
      context,
      destination,
      start + textureBeat * beatSeconds,
      1.25 * beatSeconds,
      0.0028 * breath,
      980 + ((absoluteBar + phraseIndex) % 4) * 210,
    );
  }
  if (synthMotifIndex !== null) {
    DRIFT_SYNTH_MOTIFS[synthMotifIndex].forEach(
      ([beat, scaleDegree, duration, velocity]) =>
        scheduleDriftSynthMotif(
          context,
          destination,
          DRIFT_SCALE[scaleDegree],
          start + beat * beatSeconds,
          duration * beatSeconds + 0.18,
          0.022 * velocity * breath,
        ),
    );
  }
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
  "collection-lounge": {
    id: "collection-lounge",
    tempo: 94,
    barsPerPhrase: 8,
    phraseCount: LOUNGE_VIBE_PHRASES.length,
    level: 0.126,
    fadeInSeconds: 1.1,
    echo: {
      dry: 0.96,
      delayBeats: 0.75,
      feedback: 0.045,
      filterFrequency: 2450,
      wet: 0.042,
    },
    scheduleBar: scheduleLoungeBar,
  },
  "neon-lounge": {
    id: "neon-lounge",
    tempo: 106,
    barsPerPhrase: 8,
    phraseCount: NEON_LEAD_PHRASES.length,
    level: 0.132,
    fadeInSeconds: 1.05,
    echo: {
      dry: 0.955,
      delayBeats: 0.5,
      feedback: 0.05,
      filterFrequency: 2050,
      wet: 0.048,
    },
    scheduleBar: scheduleNeonBar,
  },
  "metro-drift": {
    id: "metro-drift",
    tempo: 108,
    barsPerPhrase: 8,
    phraseCount: DRIFT_SYNTH_PHRASES.length,
    level: 0.128,
    fadeInSeconds: 1,
    echo: {
      dry: 0.958,
      delayBeats: 0.75,
      feedback: 0.055,
      filterFrequency: 2250,
      wet: 0.052,
    },
    scheduleBar: scheduleDriftBar,
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
