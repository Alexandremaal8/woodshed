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
          h('div', { class: 'row between' }, h('h3', null, nm + CHORD_TYPES[type].sym), h('span', { class: 'small muted' }, title)),
          h('p', { class: 'small muted' }, `Notes: ${notes}`),
          h('div', { class: 'chordrow scrollrow' }, shapes.map(sh => ChordDiagram(pc, type, { shape: sh, small: true, label: nm + CHORD_TYPES[type].sym, caption: sh.label }))),
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
        ['minorPent', 'majorPent', 'blues', 'major', 'minor', 'dorian', 'mixolydian'].forEach(k => chips.appendChild(h('button', { class: 'chip' + (k === scale ? ' on' : ''), onclick: () => { scale = k; st.lastNoteScale = k; Store.save(); draw(); } }, SCALES[k].name)));
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
          h('p', { class: 'small muted' }, 'The 7 chords that belong together. Tap to hear.'),
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
