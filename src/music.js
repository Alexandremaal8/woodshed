// ---------- Music theory helpers ----------
const SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const FLAT_KEYS = new Set(['F','Bb','Eb','Ab','Db','Gb','D minor','G minor','C minor','F minor','Bb minor','Eb minor']);

// Standard tuning, low to high. index 0 = low E (6th string)
const STRINGS = [
  { label: 'E', midi: 40 },
  { label: 'A', midi: 45 },
  { label: 'D', midi: 50 },
  { label: 'G', midi: 55 },
  { label: 'B', midi: 59 },
  { label: 'e', midi: 64 },
];

const INTERVALS = [
  { semi: 0,  short: 'P1', name: 'Unison' },
  { semi: 1,  short: 'm2', name: 'Minor 2nd' },
  { semi: 2,  short: 'M2', name: 'Major 2nd' },
  { semi: 3,  short: 'm3', name: 'Minor 3rd' },
  { semi: 4,  short: 'M3', name: 'Major 3rd' },
  { semi: 5,  short: 'P4', name: 'Perfect 4th' },
  { semi: 6,  short: 'TT', name: 'Tritone' },
  { semi: 7,  short: 'P5', name: 'Perfect 5th' },
  { semi: 8,  short: 'm6', name: 'Minor 6th' },
  { semi: 9,  short: 'M6', name: 'Major 6th' },
  { semi: 10, short: 'm7', name: 'Minor 7th' },
  { semi: 11, short: 'M7', name: 'Major 7th' },
  { semi: 12, short: 'P8', name: 'Octave' },
];

const SCALES = {
  major:      { name: 'Major scale',       steps: [0,2,4,5,7,9,11], degrees: ['1','2','3','4','5','6','7'] },
  minor:      { name: 'Natural minor',     steps: [0,2,3,5,7,8,10], degrees: ['1','2','b3','4','5','b6','b7'] },
  minorPent:  { name: 'Minor pentatonic',  steps: [0,3,5,7,10],     degrees: ['1','b3','4','5','b7'] },
  majorPent:  { name: 'Major pentatonic',  steps: [0,2,4,7,9],      degrees: ['1','2','3','5','6'] },
  blues:      { name: 'Blues scale',       steps: [0,3,5,6,7,10],   degrees: ['1','b3','4','b5','5','b7'] },
  dorian:     { name: 'Dorian',            steps: [0,2,3,5,7,9,10], degrees: ['1','2','b3','4','5','6','b7'] },
  mixolydian: { name: 'Mixolydian',        steps: [0,2,4,5,7,9,10], degrees: ['1','2','3','4','5','6','b7'] },
};

const CHORD_TYPES = {
  maj:  { name: 'Major',      sym: '',     iv: [0,4,7] },
  min:  { name: 'Minor',      sym: 'm',    iv: [0,3,7] },
  dim:  { name: 'Diminished', sym: 'dim',  iv: [0,3,6] },
  dom7: { name: 'Dominant 7', sym: '7',    iv: [0,4,7,10] },
  maj7: { name: 'Major 7',    sym: 'maj7', iv: [0,4,7,11] },
  m7:   { name: 'Minor 7',    sym: 'm7',   iv: [0,3,7,10] },
};

const mod12 = n => ((n % 12) + 12) % 12;

function pcOf(name) {
  const n = String(name).trim().replace('♯', '#').replace('♭', 'b');
  const base = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[n[0].toUpperCase()];
  if (base === undefined) return -1;
  let acc = 0;
  for (const c of n.slice(1)) { if (c === '#') acc++; else if (c === 'b') acc--; else return -1; }
  return mod12(base + acc);
}

function noteName(pc, preferFlats = false) {
  return (preferFlats ? FLATS : SHARPS)[mod12(pc)];
}
function bothNames(pc) {
  const s = SHARPS[mod12(pc)], f = FLATS[mod12(pc)];
  return s === f ? s : `${s}/${f}`;
}
function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function fretPc(stringIdx, fret) { return mod12(STRINGS[stringIdx].midi + fret); }
function fretMidi(stringIdx, fret) { return STRINGS[stringIdx].midi + fret; }

function scalePcs(rootPc, scaleKey) {
  return SCALES[scaleKey].steps.map(s => mod12(rootPc + s));
}

// Chord voicing for playback (guitar-like spread)
function chordVoicing(rootPc, type) {
  let r = 40 + mod12(rootPc - 4); // root between E2 and D#3
  if (r < 43) r += 12;            // keep it from getting muddy
  const iv = CHORD_TYPES[type].iv;
  const third = iv[1], fifth = iv[2], seventh = iv[3];
  const notes = [r, r + fifth, r + 12, r + 12 + third];
  if (seventh !== undefined) notes.push(r + seventh + 12); else notes.push(r + 12 + fifth);
  return notes;
}

function chordName(rootPc, type, flats) {
  return noteName(rootPc, flats) + CHORD_TYPES[type].sym;
}

// Diatonic chords of a major key (triads)
const MAJOR_KEY_CHORDS = [
  { deg: 'I',    off: 0,  type: 'maj' },
  { deg: 'ii',   off: 2,  type: 'min' },
  { deg: 'iii',  off: 4,  type: 'min' },
  { deg: 'IV',   off: 5,  type: 'maj' },
  { deg: 'V',    off: 7,  type: 'maj' },
  { deg: 'vi',   off: 9,  type: 'min' },
  { deg: 'vii°', off: 11, type: 'dim' },
];

// Keys offered in the studio
const KEYS = ['E','A','D','G','C','F','Bb','B','F#','C#','Eb','Ab'];

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// ---------- Chord shapes (for diagrams) ----------
// frets low E → high e, -1 = muted. fingers same order (0 = open / none)
const OPEN_SHAPES = {
  'C:maj':  { f: [-1,3,2,0,1,0], g: [0,3,2,0,1,0] },
  'D:maj':  { f: [-1,-1,0,2,3,2], g: [0,0,0,1,3,2] },
  'G:maj':  { f: [3,2,0,0,0,3], g: [2,1,0,0,0,3] },
  'D:min':  { f: [-1,-1,0,2,3,1], g: [0,0,0,2,3,1] },
  'D:dom7': { f: [-1,-1,0,2,1,2], g: [0,0,0,2,1,3] },
  'C:dom7': { f: [-1,3,2,3,1,0], g: [0,3,2,4,1,0] },
  'G:dom7': { f: [3,2,0,0,0,1], g: [3,2,0,0,0,1] },
  'B:dom7': { f: [-1,2,1,2,0,2], g: [0,2,1,3,0,4] },
  'C:maj7': { f: [-1,3,2,0,0,0], g: [0,3,2,0,0,0] },
  'D:maj7': { f: [-1,-1,0,2,2,2], g: [0,0,0,1,2,3] },
  'F:maj7': { f: [-1,-1,3,2,1,0], g: [0,0,3,2,1,0] },
  'D:m7':   { f: [-1,-1,0,2,1,1], g: [0,0,0,2,1,1] },
};
const BARRE_SHAPES = {
  E: { maj: [0,2,2,1,0,0], min: [0,2,2,0,0,0], dom7: [0,2,0,1,0,0], maj7: [0,2,1,1,0,0], m7: [0,2,0,0,0,0], dim: [0,1,2,0,-99,-99] },
  A: { maj: [-99,0,2,2,2,0], min: [-99,0,2,2,1,0], dom7: [-99,0,2,0,2,0], maj7: [-99,0,2,1,2,0], m7: [-99,0,2,0,1,0], dim: [-99,0,1,2,1,-99] },
};
function barreShape(kind, rootPc, type) {
  const r = kind === 'E' ? mod12(rootPc - 4) : mod12(rootPc - 9);
  const rel = BARRE_SHAPES[kind][type];
  const frets = rel.map(x => x <= -50 ? -1 : r + x);
  const fingers = frets.map(() => 0);
  if (r > 0) frets.forEach((f, i) => { if (f === r) fingers[i] = 1; });
  const rest = frets.map((f, i) => ({ f, i })).filter(o => o.f > r).sort((a, b) => a.f - b.f || a.i - b.i);
  let next = r > 0 ? 2 : 1;
  rest.forEach(o => { fingers[o.i] = Math.min(4, next++); });
  return { frets, fingers, barre: r > 0 ? r : 0, r, kind };
}
function chordShape(rootPc, type) {
  const open = OPEN_SHAPES[noteName(rootPc) + ':' + type];
  if (open) return { frets: open.f, fingers: open.g };
  const e = barreShape('E', rootPc, type), a = barreShape('A', rootPc, type);
  return e.r <= a.r ? e : a;
}
// Every useful way to play a chord: open shape (if any) + E-shape + A-shape
function chordShapesAll(rootPc, type) {
  const out = [];
  const open = OPEN_SHAPES[noteName(rootPc) + ':' + type];
  if (open) out.push({ frets: open.f, fingers: open.g, label: 'Open' });
  for (const k of ['E', 'A']) {
    const sh = barreShape(k, rootPc, type);
    sh.label = sh.r === 0 ? 'Open' : `${k}-shape barre · fret ${sh.r}`;
    if (!out.some(o => o.frets.join() === sh.frets.join())) out.push(sh);
  }
  return out;
}

// Real guitar notes of the chord shape (what the diagram shows)
function shapeMidis(rootPc, type) {
  return chordShape(rootPc, type).frets.map((f, i) => f >= 0 ? fretMidi(i, f) : null).filter(x => x !== null);
}
function parseChord(v) {
  const mm = String(v).trim().replace('♯', '#').replace('♭', 'b').match(/^([A-Ga-g])([#b]?)\s*(.*)$/);
  if (!mm) return null;
  const pc = pcOf(mm[1].toUpperCase() + mm[2]);
  const q = mm[3].trim();
  let type = null;
  if (q === '' || /^(maj|major)$/i.test(q) || q === 'M') type = 'maj';
  else if (q === 'm' || /^(min|minor|-)$/i.test(q)) type = 'min';
  else if (q === '7' || /^dom(inant)?\s*7$/i.test(q)) type = 'dom7';
  else if (/^(maj7|M7|major\s*7)$/.test(q)) type = 'maj7';
  else if (/^(m7|min7|minor\s*7)$/i.test(q)) type = 'm7';
  return type ? { pc, type } : null;
}
const EAR_CHORD_POOL = [[0,'maj'],[2,'maj'],[4,'maj'],[5,'maj'],[7,'maj'],[9,'maj'],[11,'maj'],[9,'min'],[4,'min'],[2,'min'],[11,'min']];

// Correct spelling: the note `semi` half steps above rootName, written with the letter `steps` letters above
const LETTERS = ['C','D','E','F','G','A','B'];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function spell(rootName, semi, steps) {
  const L = LETTERS[(LETTERS.indexOf(rootName[0]) + steps) % 7];
  const target = mod12(pcOf(rootName) + semi);
  let diff = mod12(target - LETTER_PC[L]); if (diff > 6) diff -= 12;
  if (Math.abs(diff) > 1) return noteName(target, /b/.test(rootName) || rootName === 'F');
  return L + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
}
function degSteps(label) { const n = parseInt(String(label).replace(/[^0-9]/g, ''), 10); return (n - 1) % 7; }
function spelledChordTones(rootName, type) {
  const iv = CHORD_TYPES[type].iv, st = [0, 2, 4, 6];
  return iv.map((s, i) => spell(rootName, s, st[i]));
}
