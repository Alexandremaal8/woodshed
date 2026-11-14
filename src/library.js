// ---------- Note index ----------
const NICE_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const ALT_NAMES  = ['', 'Db', '', 'D#', '', '', 'Gb', '', 'G#', '', 'A#', ''];
const FLAT_PCS = new Set([3, 5, 8, 10]); // Eb, F, Ab, Bb read better with flats
function niceName(pc) { return NICE_NAMES[mod12(pc)]; }
function keyNameFor(pc) { return KEYS.find(k => pcOf(k) === mod12(pc)) || niceName(pc); }

function IndexView() {
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Index', { right: levelChip() }));
  root.appendChild(h('p', { class: 'muted' }, 'Every note, with everything about it: where it is, its chords, scales and the notes it goes well with.'));
  root.appendChild(h('div', { class: 'notegrid' }, [...Array(12).keys()].map(pc =>
    h('button', { class: 'notebubble' + (ALT_NAMES[pc] ? ' acc' : ''), onclick: () => App.go('note', { pc }) },
      h('b', null, niceName(pc)), ALT_NAMES[pc] ? h('small', null, ALT_NAMES[pc]) : null))));
  root.appendChild(GlossaryCard());
  root.appendChild(h('div', { class: 'card stack' },
    h('div', { class: 'tiny' }, 'Quick reference'),
    h('div', { class: 'row between' }, h('span', null, 'Open strings'), h('b', null, 'E A D G B E')),
    h('div', { class: 'row between' }, h('span', null, 'No note between'), h('b', null, 'B–C and E–F')),
    h('div', { class: 'row between' }, h('span', null, 'Major scale'), h('b', null, 'W W H W W W H')),
    h('div', { class: 'row between' }, h('span', null, 'Minor pentatonic'), h('b', null, '1 b3 4 5 b7')),
    h('div', { class: 'row between' }, h('span', null, 'Relative minor'), h('b', null, '3 frets below the major'))));
  return root;
}

function NoteView({ pc }) {
  pc = mod12(+pc);
  const fl = FLAT_PCS.has(pc);
  const nm = niceName(pc);
  const st = Store.state;
  const root = h('div', { class: 'stack' });
  const playNote = () => { const t = AudioEngine.now(); AudioEngine.pluck(48 + pc, t, { gain: 0.4 }); AudioEngine.pluck(60 + pc, t + 0.45, { gain: 0.35 }); };

  root.appendChild(topBar('', { back: () => App.go('index') }));
  // prev / next note navigation + hero
  root.appendChild(h('div', { class: 'card hero center stack' },
    h('div', { class: 'row between' },
      h('button', { class: 'iconbtn', onclick: () => App.go('note', { pc: mod12(pc - 1) }) }, '‹'),
      h('div', null, h('div', { class: 'notehero' }, nm), ALT_NAMES[pc] ? h('div', { class: 'muted small' }, `also called ${ALT_NAMES[pc]}`) : h('div', { class: 'muted small' }, 'natural note')),
      h('button', { class: 'iconbtn', onclick: () => App.go('note', { pc: mod12(pc + 1) }) }, '›')),
    h('div', { class: 'row', style: { justifyContent: 'center' } },
      h('button', { class: 'btn primary', onclick: playNote }, icon('play', 18), ' Hear it'),
      h('button', { class: 'btn', onclick: () => App.go('studio', { key: keyNameFor(pc) }) }, '🎛 Jam in ' + nm))));

  // sections as bubble tabs
  const sections = [['where', '📍 Where'], ['chords', '🎸 Chords'], ['scales', '🪜 Scales'], ['key', '🔑 Key'], ['friends', '🤝 Friends']];
  let sec = st.lastNoteSection || 'where';
  const seg = h('div', { class: 'chips scrollchips' });
  const body = h('div', { class: 'stack' });
  root.append(seg, body);

  function renderSeg() {
    seg.innerHTML = '';
    sections.forEach(([k, l]) => seg.appendChild(h('button', { class: 'chip' + (sec === k ? ' on' : ''), onclick: () => { sec = k; st.lastNoteSection = k; Store.save(); renderSeg(); renderBody(); } }, l)));
  }
  const tapPlay = (s2, f2) => AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now(), { gain: 0.35 });

  function renderBody() {
    body.innerHTML = '';
    body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
    if (sec === 'where') {
      const marks = [];
      for (let s2 = 0; s2 < 6; s2++) for (let f = 0; f <= 15; f++) if (fretPc(s2, f) === pc) marks.push({ s: s2, f, label: nm, root: true });
      const fb = Fretboard({ from: 0, to: 15, marks, fretWidth: 42, onTap: tapPlay });
      const list = [];
      for (let s2 = 5; s2 >= 0; s2--) {
        const fs = []; for (let f = 0; f <= 12; f++) if (fretPc(s2, f) === pc) fs.push(f);
        list.push(h('div', { class: 'row between' }, h('span', null, `${STRINGS[s2].label} string`), h('b', null, fs.map(f => f === 0 ? 'open' : 'fret ' + f).join(' · '))));
      }
      body.append(
        h('div', { class: 'card stack' }, h('div', { class: 'tiny' }, `Every ${nm} on the neck (tap to hear)`), fb),
        h('div', { class: 'card stack' }, h('div', { class: 'tiny' }, 'String by string (frets 0–12)'), ...list,
          h('p', { class: 'small muted' }, 'Tip: find it on the low E or A string, then use the octave shapes (2 strings over, 2 frets up; 3 frets when you cross the B string).')));
    }
    else if (sec === 'chords') {
      const groups = [['maj', 'Major'], ['min', 'Minor'], ['dom7', 'Dominant 7'], ['maj7', 'Major 7'], ['m7', 'Minor 7']];
      groups.forEach(([type, title]) => {
        const shapes = chordShapesAll(pc, type);
        const notes = spelledChordTones(nm, type).join(' · ');
        body.appendChild(h('div', { class: 'card stack' },
          h('div', { class: 'row between' }, h('h3', null, ({ maj: `${nm} major`, min: `${nm} minor` }[type] || nm + CHORD_TYPES[type].sym)), h('span', { class: 'small muted' }, title)),
          h('p', { class: 'small muted' }, `Notes: ${notes}`),
          h('div', { class: 'chordrow scrollrow' }, shapes.map(sh => ChordDiagram(pc, type, { shape: sh, small: true, label: ({ maj: `${nm} major`, min: `${nm} minor` }[type] || nm + CHORD_TYPES[type].sym), caption: sh.label }))),
          shapes.length > 2 ? h('p', { class: 'small muted' }, `${shapes.length} ways to play it · swipe →`) : null));
      });
      body.appendChild(h('p', { class: 'small muted center' }, 'Tap a chord to hear it. Gold dots are the root.'));
    }
    else if (sec === 'scales') {
      let scale = st.lastNoteScale || 'minorPent';
      const chips = h('div', { class: 'chips scrollchips' });
      const holder = h('div', { class: 'stack' });
      const draw = () => {
        chips.innerHTML = '';
        ['minorPent', 'majorPent', 'blues', 'major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian'].forEach(k => chips.appendChild(h('button', { class: 'chip' + (k === scale ? ' on' : ''), onclick: () => { scale = k; st.lastNoteScale = k; Store.save(); draw(); } }, SCALES[k].name)));
        holder.innerHTML = '';
        const sc = SCALES[scale];
        const pcs = scalePcs(pc, scale);
        const names = sc.steps.map((s2, i) => spell(nm, s2, degSteps(sc.degrees[i])));
        const marks = marksFor(pcs, pc, 0, 15, [0,1,2,3,4,5], p => names[pcs.indexOf(p)]);
        const fb = Fretboard({ from: 0, to: 15, marks, fretWidth: 42, onTap: tapPlay });
        const firstRoot = (() => { for (let f = 3; f <= 12; f++) if (fretPc(0, f) === pc) return f; return 5; })();
        fb.scrollToFret(firstRoot + 2);
        holder.append(
          h('div', { class: 'card stack' },
            h('div', { class: 'row between' }, h('h3', null, `${nm} ${sc.name.toLowerCase()}`), h('button', { class: 'btn sm', onclick: () => {
              const t = AudioEngine.now(); const base = 52 + mod12(pc - 4);
              const seq = [...sc.steps, 12]; seq.forEach((s2, i) => AudioEngine.pluck(base + s2, t + i * 0.28, { gain: 0.35, dur: 1.2 }));
            } }, icon('play', 14), ' Play')),
            h('div', { class: 'degrow' }, pcs.map((p, i) => h('div', { class: 'deg' + (i === 0 ? ' root' : '') }, h('b', null, names[i]), h('small', null, sc.degrees[i])))),
            fb,
            h('p', { class: 'small muted' }, 'Gold = root. Scroll the neck, tap any dot to hear it.')),
          h('button', { class: 'btn primary block', onclick: () => App.go('studio', { key: keyNameFor(pc), scale }) }, `🎛 Jam with ${nm} ${sc.name.toLowerCase()}`));
      };
      draw();
      body.append(chips, holder);
    }
    else if (sec === 'key') {
      const maj = MAJOR_KEY_CHORDS.map((c, i) => ({ ...c, root: mod12(pc + c.off), name: spell(nm, c.off, i) + CHORD_TYPES[c.type].sym }));
      const relMin = mod12(pc + 9), relMaj = mod12(pc + 3);
      const chordChip = (r, type, deg, label) => h('button', { class: 'keychip', onclick: () => AudioEngine.strum(shapeMidis(r, type), AudioEngine.now() + 0.02, { gain: 0.3, spread: 0.035 }) },
        h('small', null, deg), h('b', null, label));
      const progs = [['I – V – vi – IV', [0, 4, 5, 3]], ['I – IV – V', [0, 3, 4]], ['vi – IV – I – V', [5, 3, 0, 4]], ['ii – V – I', [1, 4, 0]]];
      const minorKey = [[0, 'min', 'i'], [2, 'dim', 'ii°'], [3, 'maj', 'III'], [5, 'min', 'iv'], [7, 'min', 'v'], [8, 'maj', 'VI'], [10, 'maj', 'VII']];
      body.append(
        h('div', { class: 'card stack' },
          h('div', { class: 'row between' }, h('h3', null, `Key of ${nm} major`), h('span', { class: 'badge accent' }, `relative minor: ${spell(nm, 9, 5)}m`)),
          h('p', { class: 'small muted' }, 'The 7 chords that belong together. Tap to hear. (A letter alone, like G, means G major; “m” means minor.)'),
          h('div', { class: 'keygrid' }, maj.map(c => chordChip(c.root, c.type, c.deg, c.name))),
          h('div', { class: 'tiny', style: { marginTop: '6px' } }, 'Progressions that always work'),
          ...progs.map(([name, idx]) => h('button', { class: 'progrow', onclick: () => {
            const t = AudioEngine.now();
            idx.forEach((k, i) => AudioEngine.strum(shapeMidis(maj[k].root, maj[k].type), t + i * 1.0, { gain: 0.28, spread: 0.03, cut: 0.95 }));
          } }, h('span', { class: 'small muted' }, name), h('b', null, idx.map(k => maj[k].name).join(' – ')), icon('play', 14)))),
        h('div', { class: 'card stack' },
          h('div', { class: 'row between' }, h('h3', null, `Key of ${nm} minor`), h('span', { class: 'badge' }, `relative major: ${spell(nm, 3, 2)}`)),
          h('div', { class: 'keygrid' }, minorKey.map(([o, ty, d], i) => chordChip(mod12(pc + o), ty, d, spell(nm, o, i) + CHORD_TYPES[ty].sym))),
          h('p', { class: 'small muted' }, `Solo over a ${nm} minor song with ${nm} minor pentatonic (or the blues scale).`)));
    }
    else if (sec === 'friends') {
      const rows = [
        [7, 'Perfect 5th', 'The strongest partner: power chords, bass lines, safe landing note.'],
        [5, 'Perfect 4th', 'Stable and open. Great for riffs and double stops.'],
        [4, 'Major 3rd', 'Makes things sound happy and major.'],
        [3, 'Minor 3rd', 'Makes things sound sad, dark, minor.'],
        [10, 'Minor 7th', 'Bluesy colour. Every blues chord has it.'],
        [9, 'Major 6th', 'Sweet, country/soul sound.'],
        [2, 'Major 2nd', 'Gentle passing tone.'],
        [11, 'Major 7th', 'Dreamy and jazzy, wants to rise to the root.'],
        [6, 'Tritone', 'Maximum tension. Use it to create suspense, then resolve.'],
        [1, 'Minor 2nd', 'Crunchy clash. Slide through it, don’t sit on it.'],
      ];
      body.appendChild(h('div', { class: 'card stack' },
        h('div', { class: 'tiny' }, `Notes that go with ${nm}, from strongest to most tense`),
        ...rows.map(([iv, name, txt]) => {
          const steps = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 9: 5, 10: 6, 11: 6 }[iv];
          return h('button', { class: 'friendrow', onclick: () => { const t = AudioEngine.now(); const b = 48 + pc; AudioEngine.pluck(b, t, { gain: 0.38 }); AudioEngine.pluck(b + iv, t + 0.5, { gain: 0.38 }); AudioEngine.pluck(b, t + 1.1, { gain: 0.3 }); AudioEngine.pluck(b + iv, t + 1.1, { gain: 0.3 }); } },
            h('span', { class: 'bubble', style: { width: '44px', height: '44px', fontSize: '15px', fontWeight: 800 } }, spell(nm, iv, steps)),
            h('div', { class: 'grow', style: { textAlign: 'left' } }, h('b', null, name), h('div', { class: 'small muted' }, txt)),
            icon('play', 14));
        })));
      body.appendChild(h('p', { class: 'small muted center' }, 'Tap a row to hear the two notes together.'));
    }
  }
  renderSeg(); renderBody();
  return root;
}

// ---------- Glossary ----------
const GLOSSARY = [
  ['Root', 'The note a chord or scale is built on and named after. In Am, the root is A.'],
  ['Sharp (#)', 'Raises a note by one fret (a half step). F# is one fret above F. Nothing to do with major or minor.'],
  ['Flat (b)', 'Lowers a note by one fret. Bb is one fret below B.'],
  ['Natural (♮)', 'Cancels a sharp or flat.'],
  ['Enharmonic', 'Two names for the same note: F# = Gb, A# = Bb.'],
  ['Half step / semitone', 'The smallest distance: one fret.'],
  ['Whole step / tone', 'Two frets.'],
  ['Octave', 'The same note 12 frets (12 half steps) higher.'],
  ['Interval', 'The distance between two notes, e.g. minor 3rd = 3 frets, perfect 5th = 7 frets.'],
  ['Major chord', '1 – 3 – 5. Written as the letter alone: G = G major.'],
  ['Minor chord (m)', '1 – b3 – 5. Written with an m: Gm. Only the 3rd differs from major.'],
  ['7 (dominant 7)', 'Major chord + minor 7th: G7 = G B D F. Bluesy, wants to resolve.'],
  ['maj7', 'Major chord + major 7th: Gmaj7 = G B D F#. Dreamy. The “maj” is about the 7th.'],
  ['m7', 'Minor chord + minor 7th: Gm7 = G Bb D F. Smooth, funky.'],
  ['5 (power chord)', 'Root + 5th only, no 3rd: G5 = G D. Neither major nor minor.'],
  ['sus2 / sus4', 'The 3rd is replaced by the 2nd or 4th. Open, unresolved sound.'],
  ['add9', 'Major chord + the 9th (the 2nd an octave up). Keeps the 3rd.'],
  ['dim (°)', 'Diminished: 1 – b3 – b5. Tense. The vii° chord of a major key.'],
  ['aug (+)', 'Augmented: 1 – 3 – #5. Dreamy, suspenseful.'],
  ['Slash chord', 'Chord / bass note. G/B = G chord with B as the lowest note.'],
  ['Inversion', 'A chord with a note other than the root in the bass (3rd or 5th).'],
  ['Barre chord', 'One finger presses several strings across a fret, so the shape can move anywhere.'],
  ['Triad', 'A 3-note chord: 1, 3, 5.'],
  ['Arpeggio', 'The notes of a chord played one by one.'],
  ['Scale', 'A set of notes in order, used to build melodies and chords.'],
  ['Major scale', 'W W H W W W H. Do re mi fa sol la ti do.'],
  ['Natural minor', 'The major scale started on its 6th note. Also called Aeolian.'],
  ['Pentatonic', 'A 5-note scale. Minor pentatonic: 1 b3 4 5 b7. Major pentatonic: 1 2 3 5 6.'],
  ['Blues scale', 'Minor pentatonic + the b5 “blue note”.'],
  ['Scale degree', 'A note’s number in the scale (1 to 7). Works in every key.'],
  ['Key', 'The scale and home note a song is built around, e.g. G major.'],
  ['Key signature', 'The sharps or flats of a key. G major has one: F#.'],
  ['Circle of fifths', 'All keys arranged in 5ths: C G D A E B F#… each adds a sharp; C F Bb Eb… each adds a flat.'],
  ['Relative minor', 'The minor key with the same notes as a major key, 3 frets lower. C major ↔ A minor.'],
  ['Roman numerals (I IV V)', 'Chords named by their scale degree. Big = major, small = minor. Same in every key.'],
  ['Progression', 'A sequence of chords, e.g. I – V – vi – IV.'],
  ['Cadence', 'A chord move that ends a phrase. V → I = strong ending.'],
  ['Leading tone', 'The 7th degree, a half step below the root. It pulls up to the root.'],
  ['Mode', 'A scale started on a different note of the major scale: Dorian, Mixolydian, Lydian…'],
  ['Dorian', 'Minor with a natural 6: 1 2 b3 4 5 6 b7.'],
  ['Mixolydian', 'Major with a b7: 1 2 3 4 5 6 b7. Fits 7 chords.'],
  ['Lydian', 'Major with a #4. Dreamy.'],
  ['Phrygian', 'Minor with a b2. Dark, Spanish/metal.'],
  ['CAGED', 'The 5 open shapes C A G E D, moved up the neck to play any chord in 5 places.'],
  ['Capo', 'A clamp that raises all strings. G shapes + capo 2 = sounds in A.'],
  ['Transpose', 'Move a whole song to another key by shifting every chord the same distance.'],
  ['Tab', '6 lines = strings (top line = high e), numbers = frets.'],
  ['Chord diagram', 'Neck standing up: low E on the left, frets going down, numbers = fingers, × = don’t play, ○ = open.'],
  ['Hammer-on (h)', 'Pick a note, then press a higher fret hard enough to sound it without picking.'],
  ['Pull-off (p)', 'Pick a note, then pull the finger off to sound a lower fret.'],
  ['Slide (/ \\)', 'Move along the string while holding the note.'],
  ['Bend (b)', 'Push the string to raise the pitch. Full bend = 2 frets.'],
  ['Vibrato (~)', 'Small repeated bends on a held note.'],
  ['Palm mute (P.M.)', 'Rest the side of your picking hand on the strings near the bridge for a chunky sound.'],
  ['Beat', 'The steady pulse of the music.'],
  ['Bar / measure', 'A group of beats, usually 4.'],
  ['Time signature', '4/4, 3/4, 6/8… top = beats per bar, bottom = the note value that counts.'],
  ['BPM', 'Beats per minute: the tempo.'],
  ['Triplet', '3 notes in the space of 2.'],
  ['Shuffle / swing', 'Long-short eighth notes, the feel of blues and jazz.'],
  ['Syncopation', 'Accents between the beats.'],
  ['Motif', 'A short musical idea that you repeat and vary.'],
  ['Call and response', 'A “question” phrase followed by an “answer” phrase.'],
  ['Double stop', 'Two notes played at the same time.'],
  ['Tritone', '6 frets: the most tense interval. Also called b5 or #4.'],
];

function GlossaryCard() {
  const list = h('div', { class: 'gloss' });
  const inp = h('input', { placeholder: 'Search a term: maj7, capo, tab…', autocomplete: 'off', autocapitalize: 'off' });
  function render() {
    const q = inp.value.trim().toLowerCase();
    list.innerHTML = '';
    const items = GLOSSARY.filter(([t, d]) => !q || t.toLowerCase().includes(q) || d.toLowerCase().includes(q));
    if (!items.length) list.appendChild(h('p', { class: 'small muted' }, 'No match. Ask Claude and it can be added!'));
    items.forEach(([term, def]) => list.appendChild(h('details', { class: 'glossitem' }, h('summary', null, term), h('p', { class: 'small' }, def))));
  }
  inp.addEventListener('input', render);
  render();
  return h('div', { class: 'card stack' }, h('div', { class: 'row between' }, h('h3', null, '📖 Glossary'), h('span', { class: 'small muted' }, `${GLOSSARY.length} terms`)), inp, list);
}
