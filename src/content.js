// ---------- Course content ----------
// Fretboard mark helper: all positions of given pitch classes inside a fret window
function marksFor(pcs, rootPc, from, to, strings = [0,1,2,3,4,5], labeler) {
  const out = [];
  for (const s of strings) for (let f = from; f <= to; f++) {
    const pc = fretPc(s, f);
    if (pcs.includes(pc)) out.push({ s, f, label: labeler ? labeler(pc) : noteName(pc), root: pc === rootPc });
  }
  return out;
}
function scaleMarks(key, scaleKey, from, to, strings, useDegrees = false) {
  const r = pcOf(key), pcs = scalePcs(r, scaleKey), sc = SCALES[scaleKey];
  return marksFor(pcs, r, from, to, strings, pc => useDegrees ? sc.degrees[pcs.indexOf(pc)] : noteName(pc, FLAT_KEYS.has(key)));
}

const CHAPTERS = [
  {
    id: 'c1', title: 'The Fretboard', icon: '🎸',
    blurb: 'Know where every note lives. Everything else is built on this.',
    lessons: [
      {
        id: 'l1-1', title: 'The musical alphabet',
        cards: [
          { h: 'Only 7 letters', p: 'Music uses the letters <b>A B C D E F G</b>, then starts again at A. Between most letters there is an extra note, called a <b>sharp (#)</b> or a <b>flat (b)</b>.' },
          { h: '12 notes in total', p: 'A, A#, B, C, C#, D, D#, E, F, F#, G, G#, then A again. That’s it: every song you have ever played uses only these 12 notes.' },
          { h: 'The two exceptions', p: 'There is <b>no note between B and C</b>, and <b>none between E and F</b>. Remember “<b>BC</b> and <b>EF</b>”. This is the most important rule of the fretboard.' },
          { h: 'Sharp or flat?', p: 'A# and Bb are the <b>same note</b> with two names. Which name you use depends on the key, but your finger goes to the same fret.' },
        ],
        quiz: [
          { t: 'mc', id: 'q1-1a', q: 'Which note comes right after E (one fret higher)?', o: ['E#', 'F', 'F#', 'G'], a: 1, ex: 'There is no note between E and F.' },
          { t: 'mc', id: 'q1-1b', q: 'How many different notes are there in Western music?', o: ['7', '8', '12', '24'], a: 2, ex: '7 letters + 5 sharps/flats = 12.' },
          { t: 'mc', id: 'q1-1c', q: 'A# is the same note as…', o: ['Ab', 'Bb', 'B', 'C'], a: 1, ex: 'One fret above A = one fret below B.' },
          { t: 'mc', id: 'q1-1d', q: 'Which note comes right after B?', o: ['B#', 'Cb', 'C', 'C#'], a: 2, ex: 'B → C, no note in between.' },
        ],
        practice: { type: 'game', game: 'nameNote', strings: [0], from: 0, to: 12, title: 'Name the note (low E string)', how: 'A dot appears on the low E string. Name it as fast as you can. Count up the alphabet from the open string, remembering BC and EF.' },
        jam: { prompt: 'Warm-up jam. Play anything you like over the groove, but say the name of each note you land on out loud.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
      },
      {
        id: 'l1-2', title: 'Strings and frets',
        cards: [
          { h: 'Open strings', p: 'From the thickest to the thinnest: <b>E A D G B E</b>. Memory trick: “<b>E</b>ddie <b>A</b>te <b>D</b>ynamite, <b>G</b>ood <b>B</b>ye <b>E</b>ddie”.', fb: { from: 0, to: 4, marks: () => [0,1,2,3,4,5].map(s => ({ s, f: 0, label: STRINGS[s].label.toUpperCase(), root: s === 0 || s === 5 })) } },
          { h: 'One fret = one half step', p: 'Each fret raises the note by the smallest step, a <b>half step</b>. Two frets = a <b>whole step</b>.' },
          { h: 'The 12th fret', p: 'After 12 frets (12 half steps) you are back to the same note, one <b>octave</b> higher. That’s why the 12th fret has the double dot: the fretboard repeats from there.' },
          { h: 'Strings are a 5th of 5 frets apart', p: 'The 5th fret of a string gives the next open string (E string, 5th fret = A). The exception is the G string: its <b>4th</b> fret gives B. That’s how you tune by ear, and it’s why shapes shift by one fret when they cross from G to B.' },
        ],
        quiz: [
          { t: 'mc', id: 'q1-2a', q: 'What note is on the 5th fret of the low E string?', o: ['G', 'A', 'B', 'C'], a: 1, ex: 'E F F# G G# A: 5 half steps → A. Same as the next open string.' },
          { t: 'mc', id: 'q1-2b', q: 'What note is on the 12th fret of the G string?', o: ['F#', 'G', 'A', 'B'], a: 1, ex: '12th fret = octave of the open string.' },
          { t: 'mc', id: 'q1-2c', q: 'Which fret of the G string gives the same note as the open B string?', o: ['3rd', '4th', '5th', '7th'], a: 1, ex: 'G to B is only 4 half steps: the one exception in standard tuning.' },
          { t: 'find', id: 'q1-2d', q: 'Tap the open strings that are tuned to E.', pc: 4, strings: [0,1,2,3,4,5], from: 0, to: 0, need: 'all', ex: 'Both E strings: the 6th and the 1st.' },
        ],
        practice: { type: 'game', game: 'nameNote', strings: [0, 1], from: 0, to: 12, title: 'Name the note (E and A strings)', how: 'Use the 5th and 12th frets as landmarks. From a landmark, count up or down.' },
        jam: { prompt: 'Play a solo where every phrase ends on the note A. Find at least three different A’s on the neck.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
      },
      {
        id: 'l1-3', title: 'Notes on the E and A strings',
        cards: [
          { h: 'Why these two strings?', p: 'The roots of barre chords, power chords and most scale shapes sit on the <b>low E</b> and <b>A</b> strings. Know these and you can find any key instantly.' },
          { h: 'Low E landmarks', p: 'G = 3rd fret, A = 5th, B = 7th, C = 8th, D = 10th, E = 12th.', fb: { from: 0, to: 12, marks: () => marksFor([7,9,11,0,2,4], -1, 1, 12, [0]) } },
          { h: 'A string landmarks', p: 'B = 2nd fret, C = 3rd, D = 5th, E = 7th, F = 8th, G = 10th, A = 12th.', fb: { from: 0, to: 12, marks: () => marksFor([11,0,2,4,5,7,9], -1, 1, 12, [1]) } },
          { h: 'The same frets, different strings', p: 'Notice: the 3rd fret is G on the E string and C on the A string. A power chord with the root on the E string at fret 3 is G5; move it to the A string and it’s C5.' },
        ],
        quiz: [
          { t: 'find', id: 'q1-3a', q: 'Tap every C on the low E string (frets 0–12).', pc: 0, strings: [0], from: 0, to: 12, need: 'all', ex: 'Only the 8th fret.' },
          { t: 'find', id: 'q1-3b', q: 'Tap every D on the A string (frets 0–12).', pc: 2, strings: [1], from: 0, to: 12, need: 'all', ex: 'D is the 5th fret of the A string.' },
          { t: 'mc', id: 'q1-3c', q: 'You play a barre chord shaped like E major with the root at the 7th fret of the low E. Which chord is it?', o: ['A', 'B', 'C', 'D'], a: 1, ex: '7th fret of the low E = B.' },
          { t: 'find', id: 'q1-3d', q: 'Tap every G on the E and A strings.', pc: 7, strings: [0, 1], from: 0, to: 12, need: 'all', ex: 'E string fret 3, A string fret 10.' },
        ],
        practice: { type: 'game', game: 'findNote', strings: [0, 1], from: 0, to: 12, title: 'Find the note (30 s)', how: 'A note name appears. Tap every place it lives on the E and A strings. Go for speed.' },
        jam: { prompt: 'Change position with the chords: for each chord, play your phrase starting from that chord’s root on the E or A string.', style: 'rock', key: 'E', scale: 'minorPent', tone: 'Crunch' },
      },
      {
        id: 'l1-4', title: 'Octave shapes',
        cards: [
          { h: 'Find any note everywhere', p: 'An <b>octave shape</b> takes you from one note to the same note higher up. With two shapes you can find a note on every string.' },
          { h: 'E → D and A → G: “two strings, two frets”', p: 'From a note on the E or A string, skip one string and go <b>2 frets up</b>.', fb: { from: 3, to: 9, marks: () => [{ s: 0, f: 5, label: 'A', root: true }, { s: 2, f: 7, label: 'A' }, { s: 1, f: 3, label: 'C', root: true }, { s: 3, f: 5, label: 'C' }] } },
          { h: 'D → B and G → e: “two strings, three frets”', p: 'When the jump crosses the G–B pair, it is <b>3 frets up</b> instead (because of the G–B exception).', fb: { from: 3, to: 10, marks: () => [{ s: 2, f: 5, label: 'G', root: true }, { s: 4, f: 8, label: 'G' }, { s: 3, f: 4, label: 'B', root: true }, { s: 5, f: 7, label: 'B' }] } },
          { h: 'Same fret, two strings apart', p: 'The low E and high e strings are both E: a note on the low E is the same note at the same fret on the high e, two octaves up.' },
        ],
        quiz: [
          { t: 'find', id: 'q1-4a', q: 'A is on the 5th fret of the low E. Tap the A one octave higher on the D string.', pc: 9, strings: [2], from: 5, to: 9, need: 'one', shown: [{ s: 0, f: 5, label: 'A', root: true }], ex: 'Two strings over, two frets up: D string, 7th fret.' },
          { t: 'find', id: 'q1-4b', q: 'C is on the 3rd fret of the A string. Tap its octave on the G string.', pc: 0, strings: [3], from: 3, to: 7, need: 'one', shown: [{ s: 1, f: 3, label: 'C', root: true }], ex: 'G string, 5th fret.' },
          { t: 'find', id: 'q1-4c', q: 'G is on the 5th fret of the D string. Tap its octave on the B string.', pc: 7, strings: [4], from: 5, to: 10, need: 'one', shown: [{ s: 2, f: 5, label: 'G', root: true }], ex: 'Crossing G–B: 3 frets up → B string, 8th fret.' },
          { t: 'mc', id: 'q1-4d', q: 'The note at the 8th fret of the low E is C. What is at the 8th fret of the high e?', o: ['A', 'B', 'C', 'G'], a: 2, ex: 'Both E strings carry the same notes, two octaves apart.' },
        ],
        practice: { type: 'game', game: 'findNote', strings: [0,1,2,3,4,5], from: 0, to: 12, title: 'Find the note on all strings (30 s)', how: 'Use your octave shapes: find it on the E or A string first, then jump.' },
        jam: { prompt: 'Pick ONE phrase you like. Play it, then play the same phrase one octave higher using an octave shape.', style: 'blues', key: 'A', scale: 'minorPent', tone: 'Edge-of-breakup' },
      },
    ],
  },
  {
    id: 'c2', title: 'Intervals', icon: '📏',
    blurb: 'The distance between two notes. The real secret behind scales, chords and melodies.',
    lessons: [
      {
        id: 'l2-1', title: 'Half steps and whole steps',
        cards: [
          { h: 'The two building blocks', p: 'A <b>half step</b> (H) = 1 fret. A <b>whole step</b> (W) = 2 frets. Every scale is just a pattern of W and H.' },
          { h: 'Natural half steps', p: 'Remember BC and EF: between those letters is a half step. Between all other neighbouring letters (C–D, D–E, F–G, G–A, A–B) is a whole step.' },
          { h: 'On one string', p: 'Playing up one string you <i>see</i> the distances: C (fret 8 low E) → D is 2 frets → E is 2 frets → F is just 1 fret.', fb: { from: 7, to: 14, marks: () => marksFor([0,2,4,5], 0, 7, 14, [0]) } },
        ],
        quiz: [
          { t: 'mc', id: 'q2-1a', q: 'From E to F is a…', o: ['Half step', 'Whole step', 'Step and a half', 'Octave'], a: 0, ex: 'EF: no note between → half step.' },
          { t: 'mc', id: 'q2-1b', q: 'From G to A is a…', o: ['Half step', 'Whole step', 'Step and a half', 'Octave'], a: 1, ex: 'G# sits between them → 2 frets.' },
          { t: 'mc', id: 'q2-1c', q: 'A whole step above B is…', o: ['C', 'C#', 'D', 'Bb'], a: 1, ex: 'B→C is a half step, C→C# another one.' },
        ],
        practice: { type: 'drill', title: 'Chromatic warm-up', how: 'Starting on the low E, play frets 1-2-3-4 with one finger per fret on each string, up to the high e and back. Keep every note clean and even. Raise the tempo only when it’s clean.', bpm: 70, fb: { from: 1, to: 4, marks: () => { const m = []; for (let s = 0; s < 6; s++) for (let f = 1; f <= 4; f++) m.push({ s, f, label: String(f) }); return m; } } },
        jam: { prompt: 'Slide into every target note from one fret below (a half step). Hear how the half-step slide creates tension then release.', style: 'blues', key: 'E', scale: 'minorPent', tone: 'Edge-of-breakup' },
      },
      {
        id: 'l2-2', title: 'Naming intervals',
        cards: [
          { h: 'Count the half steps', p: 'An interval is named by how far apart two notes are. Count frets from the first note to the second.' },
          { h: 'The list', p: '1 = minor 2nd · 2 = major 2nd · 3 = <b>minor 3rd</b> · 4 = <b>major 3rd</b> · 5 = <b>perfect 4th</b> · 6 = tritone · 7 = <b>perfect 5th</b> · 8 = minor 6th · 9 = major 6th · 10 = <b>minor 7th</b> · 11 = major 7th · 12 = octave.' },
          { h: 'The ones that matter most', p: 'For soloing and chords, start with: <b>minor 3rd</b> (sad), <b>major 3rd</b> (happy), <b>perfect 5th</b> (strong, the power chord), <b>minor 7th</b> (bluesy). The others will follow.' },
        ],
        quiz: [
          { t: 'mc', id: 'q2-2a', q: 'How many frets is a perfect 5th?', o: ['5', '6', '7', '8'], a: 2, ex: 'Perfect 5th = 7 half steps.' },
          { t: 'mc', id: 'q2-2b', q: 'From A to C is…', o: ['Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Major 2nd'], a: 0, ex: 'A A# B C: 3 half steps.' },
          { t: 'mc', id: 'q2-2c', q: 'From C to E is…', o: ['Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th'], a: 1, ex: 'C C# D D# E: 4 half steps.' },
          { t: 'mc', id: 'q2-2d', q: 'A power chord (like E5) is made of the root and the…', o: ['Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave only'], a: 2, ex: 'That’s why it is called a “5” chord.' },
        ],
        practice: { type: 'game', game: 'interval', title: 'Interval hunt', how: 'A root note is shown. Tap the interval asked for. Any string works, look near the root.', set: [3, 4, 7, 12] },
        jam: { prompt: 'Two-note phrases only: play a note, then jump a 3rd or a 5th. Make it sing.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
      },
      {
        id: 'l2-3', title: 'Interval shapes',
        cards: [
          { h: 'Shapes, not counting', p: 'On guitar every interval has a <b>shape</b> across two neighbouring strings. Learn the shapes and you’ll stop counting frets.' },
          { h: 'From a root to the next string', p: '<b>Same fret</b> = perfect 4th · <b>2 frets up</b> = perfect 5th · <b>1 fret back</b> = major 3rd · <b>2 frets back</b> = minor 3rd.', fb: { from: 3, to: 8, marks: () => [{ s: 0, f: 5, label: 'R', root: true }, { s: 1, f: 5, label: '4' }, { s: 1, f: 7, label: '5' }, { s: 1, f: 4, label: '3' }, { s: 1, f: 3, label: 'b3' }] } },
          { h: 'The G–B shift', p: 'When the second note is on the B string (from the G string), move everything <b>one fret up</b>. Example: a 5th from the G string is 3 frets up on the B string.' },
        ],
        quiz: [
          { t: 'find', id: 'q2-3a', q: 'Root is A (low E, fret 5). Tap the perfect 5th on the A string.', pc: 4, strings: [1], from: 3, to: 9, need: 'one', shown: [{ s: 0, f: 5, label: 'A', root: true }], ex: 'Next string, two frets up: A string fret 7 = E.' },
          { t: 'find', id: 'q2-3b', q: 'Root is C (A string, fret 3). Tap the major 3rd on the D string.', pc: 4, strings: [2], from: 0, to: 6, need: 'one', shown: [{ s: 1, f: 3, label: 'C', root: true }], ex: 'Next string, one fret back: D string fret 2 = E.' },
          { t: 'find', id: 'q2-3c', q: 'Root is D (A string, fret 5). Tap the minor 3rd on the D string.', pc: 5, strings: [2], from: 1, to: 7, need: 'one', shown: [{ s: 1, f: 5, label: 'D', root: true }], ex: 'Two frets back: D string fret 3 = F.' },
        ],
        practice: { type: 'game', game: 'interval', title: 'Interval shapes', how: 'Use the shapes, not counting. Same fret = 4th, +2 = 5th, −1 = major 3rd, −2 = minor 3rd.', set: [3, 4, 5, 7] },
        jam: { prompt: 'Use 3rds: over each chord, play phrases that move in 3rds (skip one scale note at a time).', style: 'pop', key: 'G', scale: 'majorPent', tone: 'Clean + chorus' },
      },
      {
        id: 'l2-4', title: 'How intervals feel',
        cards: [
          { h: 'Intervals have emotions', p: '<b>Minor 3rd</b>: dark, sad. <b>Major 3rd</b>: bright, happy. <b>Perfect 5th</b>: solid, open. <b>Minor 7th</b>: bluesy, unresolved. <b>Tritone</b>: tense, “wrong” in a cool way.' },
          { h: 'Train your ear', p: 'Link each interval to a song start you know. Major 6th: “My Bonnie”. Perfect 4th: “Here Comes the Bride”. Perfect 5th: “Star Wars”. Use the <b>Ear</b> tab to practise.' },
          { h: 'Why it matters for solos', p: 'When you can <b>hear</b> the interval you want before playing it, your solos stop being finger patterns and start being melodies. That’s fluidity.' },
        ],
        quiz: [
          { t: 'mc', id: 'q2-4a', q: 'Which interval mostly makes a chord sound major or minor?', o: ['The 2nd', 'The 3rd', 'The 5th', 'The octave'], a: 1, ex: 'Major 3rd = major, minor 3rd = minor.' },
          { t: 'mc', id: 'q2-4b', q: 'Which interval gives the “bluesy, unresolved” feel?', o: ['Major 3rd', 'Perfect 5th', 'Minor 7th', 'Octave'], a: 2, ex: 'The b7 is everywhere in blues.' },
        ],
        practice: { type: 'game', game: 'interval', title: 'All main intervals', how: 'Mix of 3rds, 4ths, 5ths, 7ths and octaves. Sing the interval before you tap it.', set: [3, 4, 5, 7, 10, 12] },
        jam: { prompt: 'Make every long note a minor 7th (b7) or a 5th above the chord root. Feel the difference.', style: 'blues', key: 'A', scale: 'blues', tone: 'Edge-of-breakup' },
      },
    ],
  },
  {
    id: 'c3', title: 'The Major Scale', icon: '🪜',
    blurb: 'The mother of all scales. Every chord and mode comes from it.',
    lessons: [
      {
        id: 'l3-1', title: 'The formula: W W H W W W H',
        cards: [
          { h: 'One pattern, every key', p: 'Every major scale follows the same steps: <b>Whole, Whole, Half, Whole, Whole, Whole, Half</b>.' },
          { h: 'C major: the easy one', p: 'C D E F G A B C. No sharps or flats: the half steps fall exactly on E–F and B–C.' },
          { h: 'G major', p: 'G A B C D E <b>F#</b> G. To keep the formula, F must be raised to F#.', fb: { from: 2, to: 5, marks: () => scaleMarks('G', 'major', 2, 5, [0,1,2]) } },
        ],
        quiz: [
          { t: 'mc', id: 'q3-1a', q: 'Which note is sharp in G major?', o: ['C#', 'F#', 'G#', 'D#'], a: 1, ex: 'E→F would be a half step; the formula needs a whole step, so F#.' },
          { t: 'mc', id: 'q3-1b', q: 'The major scale formula is…', o: ['W H W W H W W', 'W W H W W W H', 'H W W W H W W', 'W W W H W W H'], a: 1, ex: 'W W H W W W H.' },
          { t: 'mc', id: 'q3-1c', q: 'What is the 3rd note of D major?', o: ['F', 'F#', 'G', 'E'], a: 1, ex: 'D (W) E (W) F#.' },
        ],
        practice: { type: 'drill', title: 'G major on three strings', how: 'Play G major up and down: E string frets 3-5-7, A string 3-5-7, D string 4-5. Say the note names as you play.', bpm: 70, fb: { from: 2, to: 8, marks: () => scaleMarks('G', 'major', 3, 7, [0, 1]).concat(scaleMarks('G', 'major', 4, 5, [2])) } },
        jam: { prompt: 'Melody time: use only the G major scale and try to play a simple melody you could sing.', style: 'pop', key: 'G', scale: 'major', tone: 'Clean + chorus' },
      },
      {
        id: 'l3-2', title: 'Scale degrees',
        cards: [
          { h: 'Numbers instead of letters', p: 'We number the notes of a scale 1 to 7. In C major: C=1, D=2, E=3, F=4, G=5, A=6, B=7. Numbers work in <b>every key</b>.' },
          { h: 'Why numbers rock', p: '“Land on the 3” or “a I–IV–V” means the same thing in any key. Musicians talk in numbers so they can transpose instantly.' },
          { h: 'Strong notes', p: 'The <b>1, 3 and 5</b> are the most stable notes (they form the chord). The 4 and 7 want to move: 7 pulls up to 1, 4 pulls down to 3.' },
        ],
        quiz: [
          { t: 'mc', id: 'q3-2a', q: 'In A major (A B C# D E F# G#), which note is the 5?', o: ['D', 'E', 'F#', 'C#'], a: 1, ex: 'A=1 B=2 C#=3 D=4 E=5.' },
          { t: 'mc', id: 'q3-2b', q: 'Which degree “pulls” strongly up to the root?', o: ['2', '4', '6', '7'], a: 3, ex: 'The 7 is a half step below the 1: it wants to resolve.' },
          { t: 'mc', id: 'q3-2c', q: 'In G major, which note is the 3?', o: ['A', 'B', 'C', 'D'], a: 1, ex: 'G=1 A=2 B=3.' },
        ],
        practice: { type: 'drill', title: 'Degrees on the neck', how: 'Play the G major shape slowly and say the degree (1, 2, 3…) instead of the note name. Then play only 1-3-5 and hear the chord appear.', bpm: 60, fb: { from: 2, to: 8, marks: () => scaleMarks('G', 'major', 3, 7, [0, 1], true).concat(scaleMarks('G', 'major', 4, 5, [2], true)) } },
        jam: { prompt: 'Tension and release: hold the 7 (F#) for a moment, then resolve it to the 1 (G). Do it again with 4 → 3.', style: 'ballad', key: 'G', scale: 'major', tone: 'Clean + delay' },
      },
      {
        id: 'l3-3', title: 'Major scale across the neck',
        cards: [
          { h: 'A full position', p: 'Here is G major in one position (frets 2 to 5). Roots in gold. Play it from the lowest root to the highest and back.', fb: { from: 1, to: 6, marks: () => scaleMarks('G', 'major', 2, 5) } },
          { h: 'Movable', p: 'This shape has no open strings, so it’s <b>movable</b>: slide it up 2 frets and you have A major. The root on the E string tells you the key.' },
          { h: 'Don’t get stuck in boxes', p: 'Shapes are maps, not cages. Use them to know where the notes are, then make melodies with them.' },
        ],
        quiz: [
          { t: 'mc', id: 'q3-3a', q: 'You move the G major shape so its root is on the 5th fret of the low E. Which key are you in?', o: ['G major', 'A major', 'C major', 'D major'], a: 1, ex: 'Low E fret 5 = A.' },
          { t: 'find', id: 'q3-3b', q: 'In this G major position, tap all the G notes (roots) between frets 2 and 5.', pc: 7, strings: [0,1,2,3,4,5], from: 2, to: 5, need: 'all', ex: 'Low E 3, D 5, high e 3. (The open G string is outside the position.)' },
        ],
        practice: { type: 'drill', title: 'G major position', how: 'Play the whole position up and down in 8th notes. One finger per fret: index on fret 2, pinky on fret 5.', bpm: 70, fb: { from: 1, to: 6, marks: () => scaleMarks('G', 'major', 2, 5) } },
        jam: { prompt: 'Stay in the G major position and make up a melody you could sing. Use space, not just notes.', style: 'pop', key: 'G', scale: 'major', tone: 'Clean + chorus' },
      },
      {
        id: 'l3-4', title: 'The relative minor',
        cards: [
          { h: 'Same notes, different home', p: 'Start the C major scale on its 6th note and you get <b>A minor</b>: A B C D E F G. Same notes, but A feels like home, and it sounds sad.' },
          { h: 'Find it fast', p: 'The relative minor is <b>3 frets below</b> the major root. G major → E minor. C major → A minor. D major → B minor.' },
          { h: 'Why it matters', p: 'A solo in A minor can use the C major shapes. Learn one shape, get two keys.' },
        ],
        quiz: [
          { t: 'mc', id: 'q3-4a', q: 'What is the relative minor of G major?', o: ['A minor', 'D minor', 'E minor', 'B minor'], a: 2, ex: 'G minus 3 half steps = E.' },
          { t: 'mc', id: 'q3-4b', q: 'What is the relative major of A minor?', o: ['C major', 'D major', 'E major', 'G major'], a: 0, ex: 'A plus 3 half steps = C.' },
          { t: 'mc', id: 'q3-4c', q: 'C major and A minor…', o: ['Share no notes', 'Share all their notes', 'Share 5 notes', 'Share only the root'], a: 1, ex: 'Same 7 notes, different starting point.' },
        ],
        practice: { type: 'drill', title: 'E minor from the G shape', how: 'Play the G major position again, but start and end on the E notes. Hear how the mood becomes darker.', bpm: 70, fb: { from: 1, to: 6, marks: () => marksFor(scalePcs(7, 'major'), 4, 2, 5) } },
        jam: { prompt: 'Minor mood: solo in A minor using the C major notes. Land on A at the end of each phrase.', style: 'rock', key: 'A', scale: 'minor', tone: 'Crunch' },
      },
    ],
  },
  {
    id: 'c4', title: 'Building Chords', icon: '🧱',
    blurb: 'Finally understand the chords you already know by heart.',
    lessons: [
      {
        id: 'l4-1', title: 'Triads: 1 – 3 – 5',
        cards: [
          { h: 'Stacking 3rds', p: 'A basic chord (a <b>triad</b>) takes the 1st, 3rd and 5th notes of a scale. C major scale → <b>C E G</b> = C major chord.' },
          { h: 'Your open chords are triads', p: 'An open C chord (x32010) plays C E G C E: just the three notes, doubled.', fb: { from: 0, to: 4, marks: () => [{ s: 1, f: 3, label: 'C', root: true }, { s: 2, f: 2, label: 'E' }, { s: 3, f: 0, label: 'G' }, { s: 4, f: 1, label: 'C', root: true }, { s: 5, f: 0, label: 'E' }] } },
          { h: 'Any order works', p: 'As long as the notes are 1, 3 and 5, it’s the same chord. That’s why so many shapes give the same chord.' },
        ],
        quiz: [
          { t: 'mc', id: 'q4-1a', q: 'Which notes make a G major chord?', o: ['G B D', 'G A B', 'G C D', 'G Bb D'], a: 0, ex: 'G major scale: G(1) A B(3) C D(5).' },
          { t: 'mc', id: 'q4-1b', q: 'Which notes make a D major chord?', o: ['D F A', 'D F# A', 'D G A', 'D E F#'], a: 1, ex: 'D(1) F#(3) A(5).' },
          { t: 'mc', id: 'q4-1c', q: 'An open G chord (320003) plays G B D G B G. Is it a triad?', o: ['Yes, only 1-3-5', 'No, it has a 7th', 'No, it has a 4th', 'No, it has a 2nd'], a: 0, ex: 'Only G, B and D, doubled.' },
        ],
        practice: { type: 'game', game: 'chordTones', title: 'Find the chord tones', how: 'A chord and a tone (root, 3rd or 5th) are shown. Tap that note anywhere on the neck.', types: ['maj'] },
        jam: { prompt: 'Chord tones only: over each chord, play only its 1, 3 and 5. It sounds “safe”. Then add passing notes in between.', style: 'pop', key: 'C', scale: 'major', tone: 'Clean + chorus' },
      },
      {
        id: 'l4-2', title: 'Major vs minor: it’s the 3rd',
        cards: [
          { h: 'One note changes everything', p: 'Major triad = 1, <b>major 3rd</b>, 5. Minor triad = 1, <b>minor 3rd</b>, 5. Lower the 3rd by one fret and major becomes minor.' },
          { h: 'You already know this', p: 'Going from E to Em you lift one finger: the G# on the G string becomes G. That G# is the major 3rd; the open G is the minor 3rd.', fb: { from: 0, to: 3, marks: () => [{ s: 0, f: 0, label: 'E', root: true }, { s: 1, f: 2, label: 'B' }, { s: 2, f: 2, label: 'E', root: true }, { s: 3, f: 1, label: 'G#' }, { s: 3, f: 0, label: 'G' }, { s: 4, f: 0, label: 'B' }, { s: 5, f: 0, label: 'E', root: true }] } },
          { h: 'Same with A / Am', p: 'A (x02220) → Am (x02210): the C# on the B string drops to C. Major 3rd → minor 3rd.' },
        ],
        quiz: [
          { t: 'mc', id: 'q4-2a', q: 'Which notes make A minor?', o: ['A C E', 'A C# E', 'A D E', 'A C Eb'], a: 0, ex: 'A, minor 3rd C, 5th E.' },
          { t: 'mc', id: 'q4-2b', q: 'D major is D F# A. D minor is…', o: ['D F A', 'D F# Ab', 'D E A', 'Db F A'], a: 0, ex: 'Lower the 3rd: F# → F.' },
          { t: 'mc', id: 'q4-2c', q: 'Diminished triad = 1, b3 and…', o: ['5', 'b5', '#5', '4'], a: 1, ex: '1 b3 b5: tense and unstable.' },
        ],
        practice: { type: 'game', game: 'chordTones', title: 'Major and minor 3rds', how: 'Find the 3rd of major and minor chords. Watch the one-fret difference.', types: ['maj', 'min'] },
        jam: { prompt: 'Over each chord, find its 3rd and land on it. You’ll hear the chord change in your solo.', style: 'rock', key: 'A', scale: 'minor', tone: 'Crunch' },
      },
      {
        id: 'l4-3', title: 'Chords from the scale',
        cards: [
          { h: 'Harmonise the scale', p: 'Build a triad on each note of the major scale, using only scale notes. You get 7 chords: <b>I ii iii IV V vi vii°</b>. Big = major, small = minor.' },
          { h: 'In C major', p: 'C, Dm, Em, F, G, Am, Bdim. That’s why C, G, Am and F go so well together: they’re all in the same family.' },
          { h: 'Progressions are numbers', p: 'I–V–vi–IV in C = C G Am F. In G = G D Em C. Thousands of songs use exactly this.' },
          { h: 'Finding the key of a song', p: 'Look at the chords: which major scale contains all of them? That’s the key, and that scale is what you solo with.' },
        ],
        quiz: [
          { t: 'mc', id: 'q4-3a', q: 'In G major, which chord is the vi?', o: ['Am', 'Bm', 'Em', 'D'], a: 2, ex: 'G A B C D E F#: 6th = E, minor.' },
          { t: 'mc', id: 'q4-3b', q: 'In C major, which chord is the V?', o: ['F', 'G', 'Am', 'G minor'], a: 1, ex: 'C D E F G: 5th = G, major.' },
          { t: 'mc', id: 'q4-3c', q: 'A song uses D, A, Bm, G. What key is it in?', o: ['A major', 'D major', 'G major', 'B minor only'], a: 1, ex: 'D=I, A=V, Bm=vi, G=IV.' },
          { t: 'mc', id: 'q4-3d', q: 'In any major key, which chords are minor?', o: ['I, IV, V', 'ii, iii, vi', 'ii, V, vi', 'Only vi'], a: 1, ex: 'ii, iii and vi are minor; vii° is diminished.' },
        ],
        practice: { type: 'drill', title: 'Play the family', how: 'In G: play G – Am – Bm – C – D – Em – F#dim, saying the numbers (I, ii, iii…). Then play I–V–vi–IV (G D Em C) and hum a melody over it.', bpm: 70 },
        jam: { prompt: 'This backing is I–vi–IV–V. Name the chords as they pass, and solo with the major pentatonic of the key.', style: 'pop', key: 'D', scale: 'majorPent', tone: 'Clean + chorus' },
      },
      {
        id: 'l4-4', title: 'Seventh chords',
        cards: [
          { h: 'Stack one more 3rd', p: 'Add the 7th to a triad and you get a <b>seventh chord</b>: 1 3 5 7. It sounds richer.' },
          { h: 'The three you need', p: '<b>maj7</b> = 1 3 5 7 (dreamy, soul, Sade-style). <b>7</b> (dominant) = 1 3 5 b7 (bluesy, wants to move). <b>m7</b> = 1 b3 5 b7 (smooth, funky).' },
          { h: 'Blues breaks the rules', p: 'In a blues, <b>every</b> chord is a dominant 7 (A7, D7, E7). That b7 is the sound of the blues.' },
        ],
        quiz: [
          { t: 'mc', id: 'q4-4a', q: 'Which notes make G7?', o: ['G B D F', 'G B D F#', 'G Bb D F', 'G B D E'], a: 0, ex: 'G major triad + b7 (F).' },
          { t: 'mc', id: 'q4-4b', q: 'Cmaj7 is C E G and…', o: ['Bb', 'B', 'A', 'D'], a: 1, ex: 'Major 7th of C = B.' },
          { t: 'mc', id: 'q4-4c', q: 'Am7 is…', o: ['A C E G', 'A C# E G', 'A C E G#', 'A C Eb G'], a: 0, ex: '1 b3 5 b7.' },
          { t: 'mc', id: 'q4-4d', q: 'In a standard 12-bar blues in A, the chords are…', o: ['A, D, E', 'A7, D7, E7', 'Am, Dm, Em', 'Amaj7, Dmaj7, E7'], a: 1, ex: 'All dominant 7s.' },
        ],
        practice: { type: 'game', game: 'chordTones', title: 'Find the 7ths', how: 'Find roots, 3rds, 5ths and 7ths of seventh chords.', types: ['dom7', 'm7', 'maj7'] },
        jam: { prompt: 'Blues with b7s: on each chord change, land on that chord’s b7 (G on A7, C on D7, D on E7).', style: 'blues', key: 'A', scale: 'blues', tone: 'Edge-of-breakup + spring reverb' },
      },
    ],
  },
  {
    id: 'c5', title: 'Pentatonic & Blues', icon: '🔥',
    blurb: 'The soloing toolbox of rock and blues, understood properly.',
    lessons: [
      {
        id: 'l5-1', title: 'Minor pentatonic: why it works',
        cards: [
          { h: 'Five notes', p: 'Minor pentatonic = natural minor without the 2 and b6: <b>1 b3 4 5 b7</b>. In A: A C D E G.' },
          { h: 'Box 1', p: 'The shape you probably already know. Roots in gold. In A it sits at frets 5–8.', fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'minorPent', 5, 8) } },
          { h: 'Why it never sounds wrong', p: 'It removes the two notes that can clash with chords. What’s left are strong notes, so it fits rock, blues, pop… almost everything in a minor key.' },
        ],
        quiz: [
          { t: 'mc', id: 'q5-1a', q: 'Notes of E minor pentatonic?', o: ['E G A B D', 'E F# G A B', 'E G# B D', 'E G A Bb D'], a: 0, ex: '1 b3 4 5 b7 of E.' },
          { t: 'mc', id: 'q5-1b', q: 'Which degrees does minor pentatonic remove from natural minor?', o: ['b3 and b7', '2 and b6', '4 and 5', '1 and 5'], a: 1, ex: '2 and b6 removed.' },
          { t: 'find', id: 'q5-1c', q: 'In A minor pentatonic box 1 (frets 5–8), tap all the A roots.', pc: 9, strings: [0,1,2,3,4,5], from: 5, to: 8, need: 'all', ex: 'Low E 5, D 7, high e 5.' },
        ],
        practice: { type: 'drill', title: 'Box 1 by degrees', how: 'Play box 1 in A slowly, saying the degrees: 1, b3, 4, 5, b7. Then play only 1 and b3 and hear the minor sound.', bpm: 75, fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'minorPent', 5, 8, [0,1,2,3,4,5], true) } },
        jam: { prompt: 'Box 1 in A, but every phrase must end on the root (A) or the 5th (E). Hear how stable those endings are.', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
      },
      {
        id: 'l5-2', title: 'The blue note',
        cards: [
          { h: 'Add one note', p: 'Add the <b>b5</b> to the minor pentatonic and you get the <b>blues scale</b>: 1 b3 4 b5 5 b7. In A: A C D <b>Eb</b> E G.' },
          { h: 'Use it as a passing note', p: 'The b5 is tension. Don’t sit on it: slide or hammer through it (4 → b5 → 5) for that instant blues sound.', fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'blues', 5, 8) } },
        ],
        quiz: [
          { t: 'mc', id: 'q5-2a', q: 'The blue note in A is…', o: ['C', 'D', 'Eb', 'G'], a: 2, ex: 'b5 of A = Eb.' },
          { t: 'mc', id: 'q5-2b', q: 'How should you usually use the blue note?', o: ['Hold it on strong beats', 'As a passing note', 'Never', 'Only as the last note'], a: 1, ex: 'It works best moving through it.' },
        ],
        practice: { type: 'drill', title: 'The 4–b5–5 move', how: 'In A: G string fret 7 (D) → fret 8 (Eb), then B string fret 5 (E). Then the same move on one string: A string frets 5 → 6 → 7. Loop it with hammer-ons and slides.', bpm: 70, fb: { from: 4, to: 9, marks: () => scaleMarks('A', 'blues', 5, 8) } },
        jam: { prompt: 'Use the blue note in at least every second phrase, always moving through it.', style: 'blues', key: 'A', scale: 'blues', tone: 'Edge-of-breakup + spring reverb' },
      },
      {
        id: 'l5-3', title: 'Major pentatonic: same box, new root',
        cards: [
          { h: 'Relative again', p: 'Major pentatonic = <b>1 2 3 5 6</b>. C major pentatonic has the same notes as A minor pentatonic: C D E G A.' },
          { h: 'The shift trick', p: 'For a major key, take your minor box and slide it <b>3 frets down</b>. A minor pentatonic box is at fret 5, so A <b>major</b> pentatonic is the same shape at fret 2. Roots (A) in gold.', fb: { from: 1, to: 6, marks: () => scaleMarks('A', 'majorPent', 2, 5) } },
          { h: 'The sound', p: 'Major pentatonic sounds sweet and country/pop. Over a major chord progression, minor pentatonic sounds bluesy; major pentatonic sounds “in” and happy.' },
        ],
        quiz: [
          { t: 'mc', id: 'q5-3a', q: 'G major pentatonic shares its notes with…', o: ['G minor pentatonic', 'E minor pentatonic', 'A minor pentatonic', 'D minor pentatonic'], a: 1, ex: 'E is the relative minor of G.' },
          { t: 'mc', id: 'q5-3b', q: 'Notes of C major pentatonic?', o: ['C D E G A', 'C Eb F G Bb', 'C D E F G', 'C E G B'], a: 0, ex: '1 2 3 5 6 of C.' },
        ],
        practice: { type: 'drill', title: 'Major vs minor', how: 'Over the same idea, play box 1 at fret 5 (A minor pent) then at fret 2 (A major pent). Hear the mood switch.', bpm: 75, fb: { from: 1, to: 9, marks: () => scaleMarks('A', 'majorPent', 2, 5) } },
        jam: { prompt: 'Major key backing: solo with major pentatonic. Then switch to minor pentatonic in the same key for 8 bars. Which do you prefer?', style: 'pop', key: 'A', scale: 'majorPent', tone: 'Clean + chorus' },
      },
      {
        id: 'l5-4', title: 'Connecting boxes',
        cards: [
          { h: 'Escape box 1', p: 'Box 2 starts where box 1 ends. In A, box 2 covers frets 7–10. Notes in common link the two.', fb: { from: 4, to: 11, marks: () => scaleMarks('A', 'minorPent', 5, 10) } },
          { h: 'Slide between them', p: 'Play a phrase in box 1, slide up one note on the G or B string, and continue in box 2. Horizontal movement = more fluid solos.' },
        ],
        quiz: [
          { t: 'find', id: 'q5-4a', q: 'In A minor pentatonic, tap the notes on the B string between frets 5 and 10.', pc: -1, multi: [9,0,2,4,7], strings: [4], from: 5, to: 10, need: 'all', ex: 'B string: 5 (E), 8 (G), 10 (A).' },
        ],
        practice: { type: 'drill', title: 'Box 1 → box 2 slides', how: 'Play box 1 up to the G string, slide to box 2, finish there. Then go back down. Smooth, no gaps.', bpm: 70, fb: { from: 4, to: 11, marks: () => scaleMarks('A', 'minorPent', 5, 10) } },
        jam: { prompt: 'Travel: start each phrase in box 1, end it in box 2 (or the opposite).', style: 'rock', key: 'A', scale: 'minorPent', tone: 'Crunch' },
      },
    ],
  },
  {
    id: 'c6', title: 'Target Notes', icon: '🎯',
    blurb: 'The step that makes solos sound like the chords: aim, don’t wander.',
    lessons: [
      {
        id: 'l6-1', title: 'Chord tones vs passing notes',
        cards: [
          { h: 'Two kinds of notes', p: 'At any moment, the notes of the current chord (1 3 5) are <b>chord tones</b>: they sound resolved. Other scale notes are <b>passing notes</b>: they create motion.' },
          { h: 'The rule of thumb', p: 'Put chord tones on strong beats and at the end of phrases. Use passing notes to travel between them.' },
        ],
        quiz: [
          { t: 'mc', id: 'q6-1a', q: 'Over a C chord, which note is a chord tone?', o: ['D', 'F', 'G', 'A'], a: 2, ex: 'C E G.' },
          { t: 'mc', id: 'q6-1b', q: 'Where should you usually place chord tones?', o: ['On weak beats only', 'On strong beats and phrase endings', 'Never at the end', 'It doesn’t matter'], a: 1, ex: 'That’s where the ear expects resolution.' },
        ],
        practice: { type: 'game', game: 'chordTones', title: 'Chord tone hunt', how: 'Find the chord tones quickly. This is what you will aim for while soloing.', types: ['maj', 'min'] },
        jam: { prompt: 'The current chord is shown big on screen. End each phrase on one of its chord tones.', style: 'pop', key: 'G', scale: 'majorPent', tone: 'Clean', target: true },
      },
      {
        id: 'l6-2', title: 'Land on the 3rd',
        cards: [
          { h: 'The money note', p: 'The <b>3rd</b> of each chord tells the ear exactly which chord is playing. Hitting it right when the chord changes makes your solo “follow the changes”.' },
          { h: 'Small moves', p: 'From one chord’s 3rd to the next chord’s 3rd is often just 1 or 2 frets. Find the nearest one, not the one in your box.' },
        ],
        quiz: [
          { t: 'mc', id: 'q6-2a', q: 'The 3rd of an Em chord is…', o: ['E', 'F#', 'G', 'G#'], a: 2, ex: 'E minor = E G B.' },
          { t: 'mc', id: 'q6-2b', q: 'The 3rd of a D chord is…', o: ['F', 'F#', 'A', 'E'], a: 1, ex: 'D F# A.' },
        ],
        practice: { type: 'game', game: 'chordTones', title: 'Find the 3rds', how: 'Only 3rds this time. Fast!', types: ['maj', 'min'], only: 1 },
        jam: { prompt: 'Target practice: when the chord changes, land on its 3rd (shown below the chord).', style: 'pop', key: 'C', scale: 'major', tone: 'Clean + chorus', target: true },
      },
    ],
  },
];


// ---------- Ear training levels ----------
const EAR_LEVELS = [
  { id: 1, name: 'Major or minor?', desc: 'Hear a chord. Is it happy (major) or sad (minor)?' },
  { id: 2, name: 'Chord types', desc: 'Major, minor, dominant 7, major 7, minor 7.' },
  { id: 3, name: 'Intervals', desc: 'Two notes: how far apart are they?' },
  { id: 4, name: 'Notes from a reference', desc: 'You hear an A, then a mystery note. Which is it?' },
  { id: 5, name: 'Progressions', desc: 'A chord progression in a key. Which numbers?' },
];
const EAR_INTERVAL_SET = [3, 4, 5, 7, 9, 10, 12, 2, 1];
const PROGRESSIONS = [
  { name: 'I – IV – V – I', steps: [[0,'maj'],[5,'maj'],[7,'maj'],[0,'maj']] },
  { name: 'I – V – vi – IV', steps: [[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']] },
  { name: 'I – vi – IV – V', steps: [[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']] },
  { name: 'ii – V – I', steps: [[2,'min'],[7,'maj'],[0,'maj']] },
  { name: 'I – IV – I – V', steps: [[0,'maj'],[5,'maj'],[0,'maj'],[7,'maj']] },
  { name: 'vi – IV – I – V', steps: [[9,'min'],[5,'maj'],[0,'maj'],[7,'maj']] },
];

// ---------- Surprise challenges ----------
const CHALLENGES = [
  { title: 'Three-note solo', text: 'Improvise for 2 minutes using only 3 notes. Make them interesting with rhythm, bends and dynamics.' },
  { title: 'One string only', text: 'Solo using only the G string. You’ll be forced to move along the neck.' },
  { title: 'Slow and deliberate', text: 'Tempo is low. Every note must count: no fast runs allowed.', bpm: 60 },
  { title: 'Call and response', text: 'Play a short phrase (the “question”), then answer it with a variation. Repeat.' },
  { title: 'Bend to the target', text: 'Every phrase must contain a bend that lands exactly in tune on a chord tone.' },
  { title: 'Random key', text: 'Here’s a key you rarely play in. Find the root first, then go.', randomKey: true },
  { title: 'Space is a note', text: 'Leave at least one full bar of silence between each phrase.' },
  { title: 'Rhythm first', text: 'Pick one note. Play it with 4 different rhythms. Then add a second note.' },
  { title: 'Start on the 3rd', text: 'Start every phrase on the 3rd of the current chord.', target: true },
  { title: 'Hum it, play it', text: 'Hum a short melody, then find it on the guitar. Do it 3 times.' },
  { title: 'Dynamics', text: 'Play the same phrase very softly, then very loudly. Use your picking hand and the volume knob.' },
  { title: 'Two positions', text: 'Each new phrase must be in a different position on the neck than the last one.' },
  { title: 'Tone swap', text: 'Pick a Pulze preset you never use and make it sound good.', toneHint: 'A preset you never use!' },
];

const LEVEL_TITLES = ['Bedroom Player', 'Riff Rookie', 'Jam Regular', 'Scale Explorer', 'Solo Seeker', 'Fretboard Navigator', 'Groove Master', 'Phrase Maker', 'Theory Wizard', 'Woodshed Legend'];
