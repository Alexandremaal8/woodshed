// ---------- Interactive components ----------

// A single quiz question. onResult(correct) is called once the user continues.
function QuestionView(q, onResult) {
  const root = h('div', { class: 'stack' });
  root.appendChild(h('h3', null, q.q));
  let answered = false;
  const fbBox = h('div');
  function finish(correct, extra) {
    if (answered) return; answered = true;
    sfx(correct ? 'chime' : 'nope');
    fbBox.appendChild(h('div', { class: 'feedback ' + (correct ? 'ok' : 'no') },
      h('b', null, correct ? 'Correct!' : 'Not quite.'), ' ', h('span', { class: 'muted' }, extra || q.ex || '')));
    fbBox.appendChild(h('button', { class: 'btn primary block', style: { marginTop: '12px' }, onclick: () => onResult(correct) }, 'Continue'));
    setTimeout(() => fbBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
  if (q.t === 'mc') {
    const opts = q.o.map((o, i) => ({ o, i }));
    const list = h('div', { class: 'col' });
    opts.forEach(({ o, i }) => {
      const b = h('button', { class: 'option', onclick: () => {
        if (answered) return;
        list.querySelectorAll('.option').forEach((x, j) => { if (j === q.a) x.classList.add('right'); });
        if (i !== q.a) b.classList.add('wrong');
        finish(i === q.a);
      } }, o);
      list.appendChild(b);
    });
    root.appendChild(list);
  } else if (q.t === 'find') {
    const pcs = q.multi || [q.pc];
    const targets = [];
    for (const st of q.strings) for (let f = q.from; f <= q.to; f++) if (pcs.includes(fretPc(st, f))) targets.push(st + ':' + f);
    const found = new Set();
    let mistakes = 0;
    const status = h('p', { class: 'muted small' }, q.need === 'all' ? `Found 0 / ${targets.length}` : 'Tap one position');
    const fb = Fretboard({
      from: Math.max(0, q.from - 1), to: Math.min(15, q.to + 1), marks: q.shown || [],
      onTap: (st, f) => {
        if (answered) return;
        const k = st + ':' + f;
        if (targets.includes(k)) {
          if (found.has(k)) return;
          found.add(k);
          fb.addMark({ s: st, f, label: noteName(fretPc(st, f)), cls: 'good' });
          AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.35 });
          if (q.need === 'one' || found.size === targets.length) finish(mistakes === 0, mistakes ? `${mistakes} wrong tap${mistakes > 1 ? 's' : ''}. ${q.ex || ''}` : q.ex);
          else status.textContent = `Found ${found.size} / ${targets.length}`;
        } else {
          mistakes++;
          const m = fb.addMark({ s: st, f, label: noteName(fretPc(st, f)), cls: 'bad' });
          setTimeout(() => m.remove(), 700);
        }
      },
    });
    root.appendChild(fb);
    root.appendChild(h('div', { class: 'row between' }, status,
      h('button', { class: 'btn sm ghost', onclick: () => {
        if (answered) return;
        targets.forEach(k => { if (!found.has(k)) { const [st, f] = k.split(':').map(Number); fb.addMark({ s: st, f, label: noteName(fretPc(st, f)), cls: 'shown' }); } });
        finish(false);
      } }, 'Show me')));
    const firstF = q.from;
    fb.scrollToFret(firstF + 2);
  }
  root.appendChild(fbBox);
  return root;
}

// Lesson: cards then quiz. opts: {onDone(result), review:[qids]}
function LessonPlayer(lesson, opts = {}) {
  const root = h('div', { class: 'stack' });
  const reviewIds = opts.review;
  const cards = reviewIds ? [] : lesson.cards;
  const quiz = reviewIds ? reviewIds.map(id => QUESTION_BY_ID[id]) : lesson.quiz;
  let ci = 0, qi = 0, correct = 0;
  function render() {
    root.innerHTML = '';
    if (ci < cards.length) {
      const c = cards[ci];
      root.appendChild(h('div', { class: 'dots' }, cards.map((_, i) => h('i', { class: i === ci ? 'on' : '' }))));
      const card = h('div', { class: 'card lessoncard' }, h('div', { class: 'tiny' }, `${lesson.title} · ${ci + 1}/${cards.length}`), h('h2', null, c.h), h('p', { html: c.p }));
      if (c.pre) card.appendChild(h('pre', { class: 'tab' }, c.pre));
      if (c.chord) card.appendChild(h('div', { class: 'chordrow' }, ChordDiagram(c.chord[0], c.chord[1], c.chord[2] ? { shape: barreShape(c.chord[2], c.chord[0], c.chord[1]) } : {})));
      if (c.box) card.appendChild(h('div', { class: 'chordrow' }, ChordDiagram(c.box.root, 'maj', { shape: { frets: c.box.frets, fingers: c.box.fingers, barre: 0 }, label: c.box.label })));
      if (c.fb) {
        const fb = Fretboard({ from: c.fb.from, to: c.fb.to, marks: c.fb.marks(), onTap: (st, f) => AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.35 }) });
        card.appendChild(fb);
        card.appendChild(h('p', { class: 'muted small' }, 'Tap the fretboard to hear notes.'));
        if (c.fb.from > 3) fb.scrollToFret(c.fb.from + 2);
      }
      root.appendChild(card);
      root.appendChild(h('div', { class: 'row' },
        ci > 0 ? h('button', { class: 'btn', onclick: () => { ci--; render(); } }, 'Back') : null,
        h('button', { class: 'btn primary grow', onclick: () => { ci++; render(); window.scrollTo(0, 0); } }, ci === cards.length - 1 ? 'Quiz time →' : 'Next')));
      return;
    }
    if (qi < quiz.length) {
      const q = quiz[qi];
      root.appendChild(h('div', { class: 'row between' }, h('div', { class: 'tiny' }, reviewIds ? `Review · ${qi + 1}/${quiz.length}` : `Quiz · ${qi + 1}/${quiz.length}`), h('div', { class: 'badge' }, `${correct} correct`)));
      root.appendChild(h('div', { class: 'card' }, QuestionView(q, ok => {
        if (ok) correct++;
        srsAnswer(q.id, ok);
        qi++; render(); window.scrollTo(0, 0);
      })));
      return;
    }
    // done
    const first = !reviewIds && !Store.state.lessonsDone[lesson.id];
    const xp = (first ? 20 : 5) + correct * 2;
    if (!reviewIds) { Store.state.lessonsDone[lesson.id] = Store.state.lessonsDone[lesson.id] || todayStr(); Store.save(); }
    root.appendChild(h('div', { class: 'card center stack' },
      h('div', { style: { fontSize: '48px' } }, correct === quiz.length ? '🏆' : correct >= quiz.length / 2 ? '👍' : '💪'),
      h('h2', null, reviewIds ? 'Review done' : 'Lesson complete'),
      h('p', { class: 'muted' }, `${correct} / ${quiz.length} correct. Missed questions will come back in your reviews.`),
      h('button', { class: 'btn primary block', onclick: () => opts.onDone && opts.onDone({ correct, total: quiz.length }) }, opts.doneLabel || 'Continue')));
    addXP(xp, reviewIds ? 'Review' : 'Lesson');
    if (correct === quiz.length && quiz.length) setTimeout(() => confetti(70), 150);
  }
  render();
  return root;
}

// ---------- Fretboard games ----------
function GameView(cfg, onDone) {
  const root = h('div', { class: 'stack' });
  const TOTAL = cfg.game === 'findNote' ? 30 : 10; // seconds for findNote, rounds otherwise
  let round = 0, score = 0, timeLeft = TOTAL, timer = null, started = false;
  const head = h('div', { class: 'row between' });
  const prompt = h('h2', { class: 'center' });
  const area = h('div');
  root.append(head, prompt, area);
  const from = cfg.from ?? 0, to = cfg.to ?? 12, strings = cfg.strings || [0,1,2,3,4,5];

  function setHead() {
    head.innerHTML = '';
    head.append(h('div', { class: 'tiny' }, cfg.title || 'Game'),
      h('div', { class: 'badge accent' }, cfg.game === 'findNote' ? `⏱ ${timeLeft}s · ${score} pts` : `Round ${Math.min(round + 1, TOTAL)}/${TOTAL} · ${score} pts`));
  }
  function end() {
    clearInterval(timer);
    const key = 'game:' + cfg.game + ':' + (cfg.strings || []).join('');
    const best = Store.state.drills[key] || 0;
    const isBest = score > best;
    if (isBest) { Store.state.drills[key] = score; Store.save(); }
    area.innerHTML = ''; prompt.textContent = '';
    area.appendChild(h('div', { class: 'card center stack' },
      h('div', { style: { fontSize: '44px' } }, isBest ? '🥇' : '🎯'),
      h('h2', null, `${score} points`),
      h('p', { class: 'muted' }, isBest ? 'New personal best!' : `Best: ${best}`),
      h('div', { class: 'row' },
        h('button', { class: 'btn grow', onclick: () => { root.replaceWith(GameView(cfg, onDone)); } }, 'Again'),
        onDone ? h('button', { class: 'btn primary grow', onclick: () => onDone(score) }, 'Continue') : null)));
    addXP(5, 'Fretboard game');
  }
  function next() {
    if (cfg.game !== 'findNote' && round >= TOTAL) return end();
    setHead();
    area.innerHTML = '';
    ({ nameNote, findNote, interval, chordTones })[cfg.game]();
  }
  function nameNote() {
    const st = pick(strings), f = randInt(from, to);
    const pc = fretPc(st, f);
    prompt.textContent = 'What note is this?';
    const fb = Fretboard({ from, to, marks: [{ s: st, f, label: '?', cls: 'shown' }] });
    area.appendChild(fb); fb.scrollToFret(f);
    const opts = shuffle([pc, ...shuffle([...Array(12).keys()].filter(x => x !== pc)).slice(0, 3)]);
    const grid = h('div', { class: 'grid2', style: { marginTop: '12px' } });
    opts.forEach(o => grid.appendChild(h('button', { class: 'option center', onclick: e => {
      if (grid.dataset.done) return; grid.dataset.done = 1;
      AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.35 });
      if (o === pc) { score++; e.target.classList.add('right'); sfx('chime'); } else { sfx('nope'); e.target.classList.add('wrong'); [...grid.children][opts.indexOf(pc)].classList.add('right'); }
      round++; setTimeout(next, o === pc ? 450 : 1100);
    } }, bothNames(o))));
    area.appendChild(grid);
  }
  function findNote() {
    const pc = randInt(0, 11);
    const targets = [];
    for (const st of strings) for (let f = from; f <= to; f++) if (fretPc(st, f) === pc) targets.push(st + ':' + f);
    const found = new Set();
    prompt.innerHTML = '';
    prompt.append('Find every ', h('span', { style: { color: 'var(--accent)' } }, bothNames(pc)));
    const fb = Fretboard({ from, to, onTap: (st, f) => {
      if (!started) return;
      const k = st + ':' + f;
      if (targets.includes(k) && !found.has(k)) {
        found.add(k); score++; setHead();
        fb.addMark({ s: st, f, label: noteName(pc), cls: 'good' });
        AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.3 });
        if (found.size === targets.length) setTimeout(next, 300);
      } else if (!targets.includes(k)) {
        score = Math.max(0, score - 1); setHead();
        const m = fb.addMark({ s: st, f, label: noteName(fretPc(st, f)), cls: 'bad' }); setTimeout(() => m.remove(), 500);
      }
    } });
    area.appendChild(fb);
    area.appendChild(h('p', { class: 'muted small center' }, `${targets.length} to find on these strings. Scroll for higher frets.`));
  }
  function interval() {
    const set = cfg.set || [3, 4, 7, 12];
    const iv = pick(set);
    const st = randInt(0, 2), f = randInt(3, 8);
    const rootPc = fretPc(st, f), target = mod12(rootPc + iv);
    const ivInfo = INTERVALS.find(x => x.semi === iv);
    prompt.innerHTML = '';
    prompt.append('Tap the ', h('span', { style: { color: 'var(--accent)' } }, ivInfo.name), ' above ', noteName(rootPc));
    let done = false;
    const fb = Fretboard({ from: Math.max(0, f - 3), to: Math.min(15, f + 6), marks: [{ s: st, f, label: 'R', root: true }], onTap: (s2, f2) => {
      if (done) return;
      const p = fretMidi(s2, f2) - fretMidi(st, f);
      const ok = fretPc(s2, f2) === target && p > 0 && (iv !== 12 || p === 12 || p === 24);
      AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.3 });
      AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now() + 0.35, { gain: 0.3 });
      if (ok) { done = true; score++; fb.addMark({ s: s2, f: f2, label: ivInfo.short, cls: 'good' }); round++; setTimeout(next, 900); }
      else { sfx('nope'); const m = fb.addMark({ s: s2, f: f2, label: '✕', cls: 'bad' }); setTimeout(() => m.remove(), 600); score = Math.max(0, score - 0); round += 0; fb.dataset.miss = (+fb.dataset.miss || 0) + 1; if (+fb.dataset.miss >= 3) { done = true; showAnswer(); } }
    } });
    function showAnswer() {
      for (let s2 = 0; s2 < 6; s2++) for (let f2 = Math.max(0, f - 3); f2 <= Math.min(15, f + 6); f2++) {
        const p = fretMidi(s2, f2) - fretMidi(st, f);
        if (fretPc(s2, f2) === target && p > 0) fb.addMark({ s: s2, f: f2, label: ivInfo.short, cls: 'shown' });
      }
      round++; setTimeout(next, 1800);
    }
    area.appendChild(fb);
    area.appendChild(h('p', { class: 'muted small center' }, 'Must be higher than the root. 3 tries.'));
  }
  function chordTones() {
    const types = cfg.types || ['maj'];
    const type = pick(types), rootPc = randInt(0, 11);
    const iv = CHORD_TYPES[type].iv;
    const idx = cfg.only !== undefined ? cfg.only : randInt(0, iv.length - 1);
    const names = ['root', '3rd', '5th', '7th'];
    const target = mod12(rootPc + iv[idx]);
    const flats = FLAT_KEYS.has(noteName(rootPc, true)) || [5, 10, 3, 8, 1].includes(rootPc);
    prompt.innerHTML = '';
    prompt.append('Tap the ', h('span', { style: { color: 'var(--accent)' } }, names[idx]), ' of ', h('b', null, chordName(rootPc, type, flats)));
    let done = false, miss = 0;
    const fb = Fretboard({ from: 0, to: 12, onTap: (s2, f2) => {
      if (done) return;
      if (fretPc(s2, f2) === target) {
        done = true; score++;
        fb.addMark({ s: s2, f: f2, label: noteName(target, flats), cls: 'good' });
        AudioEngine.strum(chordVoicing(rootPc, type), AudioEngine.now(), { gain: 0.2 });
        AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now() + 0.5, { gain: 0.4 });
        round++; setTimeout(next, 1100);
      } else {
        miss++;
        const m = fb.addMark({ s: s2, f: f2, label: noteName(fretPc(s2, f2), flats), cls: 'bad' }); setTimeout(() => m.remove(), 600);
        if (miss >= 3) { done = true; area.appendChild(h('p', { class: 'center' }, `The ${names[idx]} of ${chordName(rootPc, type, flats)} is `, h('b', null, noteName(target, flats)))); round++; setTimeout(next, 1800); }
      }
    } });
    area.appendChild(fb);
    area.appendChild(h('p', { class: 'muted small center' }, `${chordName(rootPc, type, flats)} = ${iv.map(i => noteName(rootPc + i, flats)).map((n, i) => i === idx ? '?' : n).join(' ')}`));
  }

  // intro screen
  setHead();
  prompt.textContent = '';
  area.appendChild(h('div', { class: 'card stack' }, h('h3', null, cfg.title), h('p', { class: 'muted' }, cfg.how),
    h('button', { class: 'btn primary block', onclick: () => {
      AudioEngine.ensure(); started = true;
      if (cfg.game === 'findNote') {
        timer = setInterval(() => { timeLeft--; setHead(); if (timeLeft <= 0) end(); }, 1000);
      }
      next();
    } }, 'Start')));
  root.cleanup = () => clearInterval(timer);
  return root;
}

// ---------- Drill with metronome ----------
function DrillView(cfg, lessonId, onDone) {
  let bpm = Store.state.drills[lessonId] || cfg.bpm || 70;
  let running = false, timer = null, beatN = 0;
  const bpmEl = h('div', { class: 'timer', style: { fontSize: '40px' } }, bpm);
  const beats = h('div', { class: 'row', style: { justifyContent: 'center' } }, [0,1,2,3].map(() => h('i', { class: 'beat' })));
  const startBtn = h('button', { class: 'btn primary grow', onclick: toggle }, '▶ Metronome');
  function tick() {
    const t = AudioEngine.now() + 0.02;
    AudioEngine.click(t, beatN % 4 === 0);
    const b = beatN % 4;
    [...beats.children].forEach((x, i) => x.classList.toggle('on', i === b));
    beatN++;
  }
  function restart() { clearInterval(timer); beatN = 0; tick(); timer = setInterval(tick, 60000 / bpm); }
  function toggle() {
    AudioEngine.ensure();
    running = !running;
    startBtn.textContent = running ? '■ Stop' : '▶ Metronome';
    if (running) restart(); else { clearInterval(timer); [...beats.children].forEach(x => x.classList.remove('on')); }
  }
  function setBpm(v) { bpm = Math.max(40, Math.min(220, v)); bpmEl.textContent = bpm; if (running) restart(); }
  const best = Store.state.drills[lessonId];
  const root = h('div', { class: 'stack' },
    h('div', { class: 'card stack' }, h('h3', null, cfg.title), h('p', { class: 'muted' }, cfg.how),
      cfg.pre ? h('pre', { class: 'tab' }, cfg.pre) : null,
      cfg.fb ? (() => { const fb = Fretboard({ from: cfg.fb.from, to: cfg.fb.to, marks: cfg.fb.marks(), onTap: (st, f) => AudioEngine.pluck(fretMidi(st, f), AudioEngine.now(), { gain: 0.35 }) }); if (cfg.fb.from > 3) fb.scrollToFret(cfg.fb.from + 2); return fb; })() : null),
    h('div', { class: 'card stack center' },
      h('div', { class: 'tiny' }, 'Tempo (BPM)'),
      h('div', { class: 'row', style: { justifyContent: 'center', gap: '18px' } },
        h('button', { class: 'iconbtn', onclick: () => setBpm(bpm - 5) }, '−5'), bpmEl, h('button', { class: 'iconbtn', onclick: () => setBpm(bpm + 5) }, '+5')),
      beats,
      h('div', { class: 'row' }, startBtn),
      h('p', { class: 'muted small' }, best ? `Your best clean tempo: ${best} BPM. Try +5.` : 'Start slow. Raise the tempo only when it’s clean.'),
      h('button', { class: 'btn block', onclick: () => {
        const prev = Store.state.drills[lessonId] || 0;
        if (bpm > prev) { Store.state.drills[lessonId] = bpm; Store.save(); UI.toast(`New best: ${bpm} BPM`); addXP(5, 'Tempo record'); }
        else UI.toast(`Saved. Best is still ${prev} BPM`);
      } }, '✓ I played it clean at this tempo')),
    onDone ? h('button', { class: 'btn primary block', onclick: () => { clearInterval(timer); onDone(); } }, 'Continue') : null);
  root.cleanup = () => clearInterval(timer);
  return root;
}

// ---------- Studio: backing track + recording ----------
// cfg: {style, key, bpm, scale, prompt, tone, target, title, challenge}
function StudioView(cfg = {}, opts = {}) {
  const st = Store.state;
  let style = cfg.style && styleUnlocked(cfg.style) ? cfg.style : (cfg.style ? 'rock' : (st.lastStudio?.style || 'rock'));
  let key = cfg.key || st.lastStudio?.key || 'A';
  let bpm = cfg.bpm || AudioEngine.STYLES[style].bpm;
  let scale = cfg.scale || AudioEngine.STYLES[style].scales[0];
  let curChord = null, nextChord = null;
  let meterRAF = null, recTimer = null;
  const root = h('div', { class: 'stack' });

  const flatsFor = k => FLAT_KEYS.has(k) || ['F','Bb','Eb','Ab','Db','Gb'].includes(k);
  function keyLabel() {
    const t = AudioEngine.STYLES[style].tonality;
    return t === 'minor' ? `${key} minor` : t === 'major' ? `${key} major` : t === 'blues' ? `${key} blues` : key;
  }

  const chordEl = h('div', { class: 'chordbig' }, '–');
  const nextEl = h('div', { class: 'muted small' }, '');
  const targetEl = h('div', { class: 'small', style: { color: 'var(--accent2)' } });
  const beatsEl = h('div', { class: 'row', style: { justifyContent: 'center' } }, [0,1,2,3].map(() => h('i', { class: 'beat' })));
  const playBtn = h('button', { class: 'btn grow', onclick: () => togglePlay() }, '▶ Play backing');
  const meter = h('div', { class: 'meter grow' }, h('i'));
  const recTime = h('div', { class: 'timer' }, '0:00');
  const recBtn = h('button', { class: 'recbtn', onclick: () => toggleRec(), 'aria-label': 'Record' }, h('span'));
  const recStatus = h('p', { class: 'muted small center' }, 'Plug in your Pulze Mini, then tap to record.');
  const fbHolder = h('div');

  function renderFretboard() {
    fbHolder.innerHTML = '';
    const marks = scaleMarks(key, scale, 0, 15, [0,1,2,3,4,5]);
    const fb = Fretboard({ from: 0, to: 15, marks, fretWidth: 42, onTap: (s2, f2) => AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now(), { gain: 0.35 }) });
    fbHolder.appendChild(fb);
    const rootFret = (() => { for (let f = 3; f <= 12; f++) if (fretPc(0, f) === pcOf(key)) return f; return 5; })();
    fb.scrollToFret(rootFret + 2);
  }

  function onBar(bar, rootPc, type, np) {
    const fl = flatsFor(key);
    curChord = { rootPc, type };
    chordEl.textContent = AudioEngine.STYLES[style].tonality === 'none' ? '♩' : chordName(rootPc, type, fl);
    const nr = mod12(pcOf(key) + np[0]);
    nextEl.textContent = AudioEngine.STYLES[style].tonality === 'none' ? '' : 'next: ' + chordName(nr, np[1], fl);
    if (cfg.target && AudioEngine.STYLES[style].tonality !== 'none') {
      const iv = CHORD_TYPES[type].iv;
      targetEl.textContent = `🎯 3rd = ${noteName(rootPc + iv[1], fl)} · 5th = ${noteName(rootPc + iv[2], fl)}`;
    } else targetEl.textContent = '';
  }
  function onBeat(b) { [...beatsEl.children].forEach((x, i) => x.classList.toggle('on', i === b)); }

  function startPlay() {
    AudioEngine.startBacking({ style, key, bpm }, { onBar, onBeat });
    playBtn.textContent = '■ Stop backing';
  }
  function stopPlay() {
    AudioEngine.stopBacking();
    playBtn.textContent = '▶ Play backing';
    chordEl.textContent = '–'; nextEl.textContent = ''; targetEl.textContent = '';
    [...beatsEl.children].forEach(x => x.classList.remove('on'));
  }
  function togglePlay() { AudioEngine.ensure(); if (AudioEngine.backingPlaying) stopPlay(); else startPlay(); }
  function restartIfPlaying() { if (AudioEngine.backingPlaying && !AudioEngine.isRecording()) startPlay(); }

  async function toggleRec() {
    AudioEngine.ensure();
    if (AudioEngine.isRecording()) return stopRec();
    try {
      recStatus.textContent = 'Opening input…';
      await AudioEngine.openInput(st.settings.inputId);
      AudioEngine.setInputGain(st.settings.inputGain);
      AudioEngine.setMonitor(st.settings.monitor);
      if (!AudioEngine.backingPlaying && style !== 'metronome') startPlay();
      if (!AudioEngine.backingPlaying && style === 'metronome') startPlay();
      AudioEngine.startRecording({ includeBacking: st.settings.includeBacking, backingLevel: st.settings.backingInRec, syncMs: st.settings.syncMs ?? AudioEngine.estimatedLatencyMs() });
      recBtn.classList.add('on');
      recStatus.innerHTML = '';
      recStatus.append(h('span', { class: 'recdot' }), ' Recording…');
      const tick = () => { recTime.textContent = fmtTime(AudioEngine.elapsed()); meter.firstChild.style.width = Math.min(100, AudioEngine.level() * 110) + '%'; meterRAF = requestAnimationFrame(tick); };
      tick();
    } catch (e) {
      recStatus.textContent = 'Could not open the input: ' + (e && e.message ? e.message : e) + '. Allow microphone access in Settings › Safari (or for the app).';
    }
  }
  async function stopRec() {
    cancelAnimationFrame(meterRAF);
    const res = await AudioEngine.stopRecording();
    stopPlay();
    AudioEngine.closeInput();
    recBtn.classList.remove('on');
    meter.firstChild.style.width = '0%';
    recStatus.textContent = 'Plug in your Pulze Mini, then tap to record.';
    if (!res || !res.blob.size) { UI.toast('Nothing recorded'); return; }
    saveSheet(res);
  }

  function saveSheet(res) {
    const defTitle = cfg.title || `${AudioEngine.STYLES[style].name} in ${keyLabel()}`;
    const titleIn = h('input', { value: defTitle });
    const toneIn = h('input', { value: st.lastTone || '', placeholder: 'e.g. “Plexi crunch”, “Clean + delay”' });
    let fav = false;
    const audio = h('audio', { controls: true, src: URL.createObjectURL(res.blob), style: { width: '100%' } });
    const md = UI.modal(h('div', { class: 'stack' },
      h('h2', null, 'Save this take?'),
      h('p', { class: 'muted small' }, `${fmtTime(res.duration)} · ${AudioEngine.STYLES[style].name} · ${keyLabel()} · ${bpm} BPM`),
      audio,
      h('div', { class: 'tiny' }, 'Title'), titleIn,
      h('div', { class: 'tiny' }, 'Pulze tone / preset used'), toneIn,
      h('div', { class: 'row between' }, h('span', null, '♥ Favourite'), toggleEl(false, v => fav = v)),
      h('div', { class: 'row' },
        h('button', { class: 'btn danger grow', onclick: async () => { if (await UI.confirm('Discard this take?', 'It will be deleted.', 'Discard', true)) { md.close(); opts.onDiscard && opts.onDiscard(); } } }, 'Discard'),
        h('button', { class: 'btn primary grow', onclick: async () => {
          const rec = {
            id: 'r' + Date.now(), blob: res.blob, mime: res.mime, createdAt: Date.now(), duration: res.duration,
            title: titleIn.value.trim() || defTitle, tone: toneIn.value.trim(), fav,
            ctx: { style, key: keyLabel(), bpm, scale, prompt: cfg.prompt || '', source: opts.mode || 'studio', lesson: cfg.lessonId || null },
          };
          try { await RecDB.put(rec); } catch (e) { UI.toast('Could not save: ' + e.message); return; }
          st.lastTone = rec.tone; Store.save();
          md.close();
          UI.toast('Saved to your Journal');
          opts.onSaved && opts.onSaved(rec);
        } }, 'Save'))));
  }

  function styleChips() {
    return h('div', { class: 'chips' }, Object.entries(AudioEngine.STYLES).map(([k, sv]) => {
      const locked = !styleUnlocked(k);
      return h('button', { class: 'chip' + (k === style ? ' on' : '') + (locked ? ' locked' : ''), onclick: () => {
        if (locked) return UI.toast(`Unlocks at ${sv.xp} XP (you have ${Store.state.xp})`);
        if (AudioEngine.isRecording()) return;
        style = k; bpm = sv.bpm; scale = sv.scales[0]; saveLast(); render(); restartIfPlaying();
      } }, (locked ? '🔒 ' : '') + sv.name);
    }));
  }
  function saveLast() { st.lastStudio = { style, key }; Store.save(); }

  function render() {
    root.innerHTML = '';
    const sv = AudioEngine.STYLES[style];
    if (cfg.prompt) root.appendChild(h('div', { class: 'card hero stack' },
      h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, cfg.challenge ? 'Challenge' : 'Your mission'),
      cfg.challenge ? h('h3', null, cfg.challenge) : null,
      h('p', null, cfg.prompt),
      h('p', { class: 'small muted' }, '🎛 Suggested tone: ' + (cfg.tone || sv.tone))));
    if (!opts.lockStyle) root.appendChild(styleChips());
    const keySel = h('select', { onchange: e => { key = e.target.value; saveLast(); renderFretboard(); restartIfPlaying(); } }, KEYS.map(k => h('option', { value: k, selected: k === key ? true : null }, k)));
    const scaleSel = h('select', { onchange: e => { scale = e.target.value; renderFretboard(); } },
      [...new Set([...sv.scales, 'minorPent', 'majorPent', 'blues', 'major', 'minor', 'dorian', 'mixolydian', 'lydian', 'phrygian'])].map(k => h('option', { value: k, selected: k === scale ? true : null }, SCALES[k].name)));
    const bpmLbl = h('span', { class: 'timer' }, bpm + ' BPM');
    const bpmIn = h('input', { type: 'range', class: 'slider', min: 50, max: 180, value: bpm, oninput: e => { bpm = +e.target.value; bpmLbl.textContent = bpm + ' BPM'; }, onchange: () => restartIfPlaying() });
    root.appendChild(h('div', { class: 'card stack' },
      h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'tiny' }, 'Key'), keySel), h('div', { class: 'grow', style: { flex: 2 } }, h('div', { class: 'tiny' }, 'Scale to use'), scaleSel)),
      h('div', { class: 'row between' }, h('div', { class: 'tiny' }, 'Tempo'), bpmLbl), bpmIn));
    root.appendChild(h('div', { class: 'card stack center' },
      h('div', { class: 'tiny' }, sv.tonality === 'none' ? 'Metronome' : keyLabel()),
      chordEl, nextEl, targetEl, beatsEl,
      h('div', { class: 'row' }, playBtn)));
    root.appendChild(h('div', { class: 'card stack' }, h('div', { class: 'row between' }, h('div', { class: 'tiny' }, SCALES[scale].name + ' · ' + key), h('div', { class: 'small muted' }, 'gold = root')), fbHolder));
    root.appendChild(h('div', { class: 'card stack center' },
      h('div', { class: 'row', style: { justifyContent: 'center' } }, recBtn),
      h('div', { class: 'row' }, recTime, meter),
      recStatus,
      opts.mode === 'session' ? null : h('button', { class: 'btn sm ghost', onclick: () => { cleanupStudio(); App.go('calibrate'); } }, `⏱ Recording sync: ${st.settings.syncMs ?? 'auto'}${st.settings.syncMs != null ? ' ms' : ''} · calibrate`),
      opts.footer || null));
    renderFretboard();
  }
  function cleanupStudio() { cancelAnimationFrame(meterRAF); if (AudioEngine.isRecording()) AudioEngine.stopRecording(); AudioEngine.stopBacking(); AudioEngine.closeInput(); }
  render();
  root.cleanup = () => { cancelAnimationFrame(meterRAF); if (AudioEngine.isRecording()) AudioEngine.stopRecording(); AudioEngine.stopBacking(); AudioEngine.closeInput(); };
  return root;
}

// ---------- Ear training ----------
// Fretboard showing every place a note (or a pair of notes) lives, for the answer reveal
function notePositionsBoard(pcs, rootPc, to = 12) {
  const marks = [];
  for (let st = 0; st < 6; st++) for (let f = 0; f <= to; f++) {
    const pc = fretPc(st, f);
    if (pcs.includes(pc)) marks.push({ s: st, f, label: noteName(pc), root: pc === rootPc });
  }
  return Fretboard({ from: 0, to, marks, fretWidth: 40, onTap: (s2, f2) => AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now(), { gain: 0.35 }) });
}
function playShape(rootPc, type, t, opts = {}) {
  const ms = shapeMidis(rootPc, type);
  AudioEngine.strum(ms, t, { gain: 0.32, spread: 0.035, ...opts });
  return ms;
}
function howTo(title, ...els) { return h('div', { class: 'howto' }, h('div', { class: 'tiny' }, title), ...els); }

function makeEarQuestion(level) {
  const now = () => AudioEngine.now() + 0.05;
  if (level === 'N') {
    // single note, no reference: guess the note
    const m = randInt(52, 66), pc = mod12(m);
    const playFn = () => { const t = now(); AudioEngine.pluck(m, t, { gain: 0.45 }); AudioEngine.pluck(m, t + 1.1, { gain: 0.35 }); };
    const opts = shuffle([pc, ...shuffle([...Array(12).keys()].filter(x => x !== pc)).slice(0, 3)]).map(bothNames);
    return { level, tag: 'Note', prompt: 'Which note is this?', play: playFn, options: opts, answer: bothNames(pc), accept: v => pcOf(v) === pc, reveal: nameWithAlt(pc),
      refBtn: () => AudioEngine.pluck(57, AudioEngine.now(), { gain: 0.4 }), refHint: 'Stuck? Tap A to hear an A for comparison.',
      show: () => howTo(`Where to play ${bothNames(pc)} (tap to hear)`, notePositionsBoard([pc], pc)) };
  }
  if (level === 'C') {
    const [rootPc, type] = pick(EAR_CHORD_POOL);
    const nm = chordName(rootPc, type, rootPc === 10);
    const playFn = () => { const t = now(); const ms = playShape(rootPc, type, t); ms.forEach((m, i) => AudioEngine.pluck(m, t + 1.4 + i * 0.2, { gain: 0.25, dur: 1.6 })); };
    const others = shuffle(EAR_CHORD_POOL.filter(([r, ty]) => !(r === rootPc && ty === type))).slice(0, 3);
    const opts = shuffle([[rootPc, type], ...others]).map(([r, ty]) => chordName(r, ty));
    return { level, tag: 'Chord', prompt: 'Which chord is this?', play: playFn, options: opts, answer: chordName(rootPc, type),
      accept: v => { const p = parseChord(v); return !!p && p.pc === rootPc && p.type === type; }, reveal: fullChordName(rootPc, type),
      refBtn: () => AudioEngine.pluck(57, AudioEngine.now(), { gain: 0.4 }), refHint: 'Tap A to hear an A note for comparison.',
      show: () => howTo('How to play it (tap the chord to hear)', h('div', { class: 'chordrow' }, ChordDiagram(rootPc, type, { label: fullChordName(rootPc, type).replace(/ \(.*\)/, '') }))) };
  }
  if (level === 1 || level === 2) {
    const types = level === 1 ? ['maj', 'min'] : ['maj', 'min', 'dom7', 'maj7', 'm7'];
    const type = pick(types), rootPc = randInt(0, 11);
    const playFn = () => { const t = now(); const ms = playShape(rootPc, type, t); ms.forEach((m, i) => AudioEngine.pluck(m, t + 1.4 + i * 0.2, { gain: 0.25, dur: 1.6 })); };
    const label = t => CHORD_TYPES[t].name;
    return { level, prompt: level === 1 ? 'Major or minor?' : 'Which chord type?', play: playFn, options: types.map(label), answer: label(type),
      accept: v => matchChordType(v) === type, reveal: fullChordName(rootPc, type) + ' · ' + ({ maj: 'major = 1 3 5, happy', min: 'minor = 1 b3 5, sad', dom7: 'dominant 7 = major + b7, bluesy and tense', maj7: 'major 7 = major + 7, soft and dreamy', m7: 'minor 7 = minor + b7, smooth' }[type]),
      show: () => howTo('How to play it (tap the chord to hear)', h('div', { class: 'chordrow' }, ChordDiagram(rootPc, type, { label: fullChordName(rootPc, type).replace(/ \(.*\)/, '') }))) };
  }
  if (level === 3) {
    const pool = EAR_INTERVAL_SET.slice(0, Store.state.ear.typed[3] ? 9 : 7);
    const iv = pick(pool), r = randInt(48, 60);
    const info = INTERVALS.find(x => x.semi === iv);
    const playFn = () => { const t = now(); AudioEngine.pluck(r, t, { gain: 0.4 }); AudioEngine.pluck(r + iv, t + 0.7, { gain: 0.4 }); AudioEngine.pluck(r, t + 1.6, { gain: 0.3 }); AudioEngine.pluck(r + iv, t + 1.6, { gain: 0.3 }); };
    const opts = shuffle([iv, ...shuffle(pool.filter(x => x !== iv)).slice(0, 3)]).map(x => INTERVALS.find(y => y.semi === x).name);
    // show the shape: root on low E or A string
    const show = () => {
      let st = r < 45 ? 0 : (r - 45 <= 9 ? 1 : 2);
      const f = r - STRINGS[st].midi;
      const target = r + iv;
      let best = null;
      for (let s2 = st; s2 < 6; s2++) { const f2 = target - STRINGS[s2].midi; if (f2 >= 0 && f2 <= 15 && (!best || Math.abs(f2 - f) < Math.abs(best.f - f))) best = { s: s2, f: f2 }; }
      const marks = [{ s: st, f, label: 'R', root: true }];
      if (best) marks.push({ s: best.s, f: best.f, label: info.short });
      const lo = Math.max(0, Math.min(f, best ? best.f : f) - 2), hi = Math.min(15, Math.max(f, best ? best.f : f) + 2);
      const fb = Fretboard({ from: lo, to: Math.max(hi, lo + 5), marks, onTap: (s2, f2) => AudioEngine.pluck(fretMidi(s2, f2), AudioEngine.now(), { gain: 0.35 }) });
      return howTo(`${info.name}: ${noteName(r)} → ${noteName(r + iv)} (tap to hear)`, fb);
    };
    return { level, prompt: 'Which interval?', play: playFn, options: opts, answer: info.name, accept: v => matchInterval(v) === iv, reveal: `${info.name} (${iv} half steps)`, show };
  }
  if (level === 4) {
    const ref = 57; // A3
    const off = randInt(1, 11), pc = mod12(9 + off);
    const playFn = () => { const t = now(); AudioEngine.pluck(ref, t, { gain: 0.4 }); AudioEngine.pluck(ref + off, t + 1.0, { gain: 0.45 }); };
    const opts = shuffle([pc, ...shuffle([...Array(12).keys()].filter(x => x !== pc && x !== 9)).slice(0, 3)]).map(bothNames);
    return { level, prompt: 'First note is A. What is the second note?', play: playFn, options: opts, answer: bothNames(pc), accept: v => pcOf(v) === pc, reveal: nameWithAlt(pc),
      refBtn: () => AudioEngine.pluck(ref, AudioEngine.now(), { gain: 0.4 }),
      show: () => howTo(`A (gold) and ${bothNames(pc)} on the neck`, notePositionsBoard([9, pc], 9)) };
  }
  // level 5: progressions
  const prog = pick(PROGRESSIONS), keyPc = randInt(0, 11);
  const playFn = () => { const t = now(); prog.steps.forEach(([o, ty], i) => playShape(mod12(keyPc + o), ty, t + i * 1.2, { gain: 0.28, spread: 0.03, cut: 1.1 })); };
  const opts = shuffle([prog, ...shuffle(PROGRESSIONS.filter(p => p !== prog)).slice(0, 3)]).map(p => p.name);
  const fl = [5, 10, 3, 8, 1].includes(keyPc);
  return { level, prompt: 'Which progression?', play: playFn, options: opts, answer: prog.name,
    accept: v => normProg(v) === normProg(prog.name), reveal: prog.name + ' in ' + noteName(keyPc, fl),
    show: () => howTo('The chords (tap to hear)', h('div', { class: 'chordrow' }, prog.steps.map(([o, ty]) => ChordDiagram(mod12(keyPc + o), ty, { small: true, label: fullChordName(mod12(keyPc + o), ty, fl).replace(/ \(.*\)/, '') })))) };
}
function matchChordType(v) {
  const x = v.toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = { major: 'maj', maj: 'maj', minor: 'min', min: 'min', m: 'min', dominant7: 'dom7', dom7: 'dom7', dominant: 'dom7', '7': 'dom7', seventh: 'dom7', major7: 'maj7', maj7: 'maj7', majorseventh: 'maj7', minor7: 'm7', min7: 'm7', m7: 'm7', minorseventh: 'm7' };
  if (v.trim() === 'M7') return 'maj7';
  if (v.trim() === 'M') return 'maj';
  return map[x] || null;
}
function matchInterval(v) {
  const raw = v.trim();
  const ex = INTERVALS.find(i => i.short === raw || i.short.toLowerCase() === raw.toLowerCase() && raw[0].toLowerCase() === 'p');
  if (ex) return ex.semi;
  let x = raw.toLowerCase().replace('second', '2nd').replace('third', '3rd').replace('fourth', '4th').replace('fifth', '5th').replace('sixth', '6th').replace('seventh', '7th').replace(/\s+/g, '');
  const f = INTERVALS.find(i => i.name.toLowerCase().replace(/\s+/g, '') === x);
  return f ? f.semi : null;
}
function normProg(v) { return v.replace(/[^IViv°]/g, ''); }

function EarRun({ levels, count = 10, daily = false, onDone }) {
  const root = h('div', { class: 'stack' });
  let n = 0, correct = 0;
  function nextQ() {
    if (n >= count) return finish();
    const level = pick(levels);
    const q = makeEarQuestion(level);
    const typed = Store.state.ear.typedAvail?.[level] && Store.state.ear.typed[level];
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'row between' }, h('div', { class: 'tiny' }, `${daily ? 'Daily ear challenge' : 'Ear practice'} · ${n + 1}/${count}`), h('div', { class: 'badge' }, `${q.tag || 'L' + level} · ${correct} ✓`)));
    let answered = false;
    const fbBox = h('div');
    function result(ok, chosen) {
      if (answered) return; answered = true;
      if (ok) correct++;
      earRecord(level, ok);
      sfx(ok ? 'chime' : 'nope');
      let hint = null;
      if (!ok && chosen && (level === 'N' || level === 4)) {
        const cp = pcOf(String(chosen).split('/')[0]), ap = pcOf(String(q.answer).split('/')[0]);
        if (cp >= 0) { let d = mod12(cp - ap); if (d > 6) d -= 12; hint = `You picked ${chosen}: ${Math.abs(d)} half step${Math.abs(d) > 1 ? 's' : ''} too ${d > 0 ? 'high' : 'low'}. ${Math.abs(d) <= 1 ? 'Very close!' : ''}`; }
      }
      fbBox.appendChild(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('b', null, ok ? 'Yes! ' : 'Answer: '), q.reveal, hint ? h('div', { class: 'small', style: { marginTop: '6px', color: 'var(--accent2)' } }, hint) : null));
      fbBox.appendChild(h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn grow', onclick: () => q.play() }, 'Hear again'),
        h('button', { class: 'btn primary grow', onclick: () => { n++; nextQ(); } }, 'Next')));
      if (q.show) { try { fbBox.appendChild(q.show()); } catch (e) { console.error(e); } }
      setTimeout(() => fbBox.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
    const card = h('div', { class: 'card stack center' },
      h('h2', null, q.prompt),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn primary big', onclick: () => { AudioEngine.ensure(); q.play(); } }, icon('play', 20), ' Play'),
        q.refBtn ? h('button', { class: 'btn big', onclick: q.refBtn }, 'A') : null),
      q.refHint ? h('p', { class: 'small muted' }, q.refHint) : null);
    root.appendChild(card);
    if (typed) {
      const inp = h('input', { placeholder: level === 3 ? 'e.g. minor 3rd, P5' : level === 4 || level === 'N' ? 'e.g. C#' : level === 'C' ? 'e.g. G, Am, Bb' : level === 5 ? 'e.g. I V vi IV' : 'e.g. minor, maj7', autocapitalize: 'off', autocomplete: 'off' });
      root.appendChild(h('form', { class: 'row', onsubmit: e => { e.preventDefault(); if (!inp.value.trim()) return; result(q.accept(inp.value), inp.value.trim()); } }, inp, h('button', { class: 'btn primary', type: 'submit' }, 'OK')));
      root.appendChild(h('p', { class: 'muted small center' }, 'Typed mode is on. You can turn it off in the Ear tab.'));
    } else {
      const list = h('div', { class: 'col' });
      q.options.forEach(o => list.appendChild(h('button', { class: 'option', onclick: e => {
        if (answered) return;
        const ok = o === q.answer;
        e.target.classList.add(ok ? 'right' : 'wrong');
        if (!ok) [...list.children].forEach(b => { if (b.textContent === q.answer) b.classList.add('right'); });
        result(ok, o);
      } }, o)));
      root.appendChild(list);
    }
    root.appendChild(fbBox);
    setTimeout(() => { try { q.play(); } catch (e) {} }, 250);
  }
  function finish() {
    root.innerHTML = '';
    let xp = correct;
    if (daily && Store.state.ear.dailyDate !== todayStr()) { xp += 15; Store.state.ear.dailyDate = todayStr(); Store.state.ear.dailyScore = correct; Store.save(); }
    root.appendChild(h('div', { class: 'card center stack' },
      h('div', { style: { fontSize: '48px' } }, correct >= count * 0.8 ? '👂✨' : '👂'),
      h('h2', null, `${correct} / ${count}`),
      h('p', { class: 'muted' }, daily ? 'Daily challenge done. Come back tomorrow for a new one.' : 'Nice practice.'),
      h('button', { class: 'btn primary block', onclick: () => onDone && onDone(correct) }, 'Done')));
    if (xp) addXP(xp, daily ? 'Daily ear challenge' : 'Ear practice');
    if (correct >= count * 0.8) setTimeout(() => confetti(80), 150);
  }
  root.start = () => { AudioEngine.ensure(); nextQ(); };
  return root;
}
