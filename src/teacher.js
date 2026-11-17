// ---------- "Teacher" features: the app listens, gives feedback, tests, and tells you what to work on ----------

// Listening loop shared by Play-it and the tuner
function Listener(onFrame) {
  let raf = null, last = 0, alive = true;
  async function start() {
    await AudioEngine.openInput(Store.state.settings.inputId);
    AudioEngine.setInputGain(Store.state.settings.inputGain);
    AudioEngine.setMonitor(false);
    const loop = now => {
      if (!alive) return;
      if (now - last > 55) { last = now; onFrame(AudioEngine.detectPitch()); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  function stop() { alive = false; cancelAnimationFrame(raf); AudioEngine.closeInput(); }
  return { start, stop };
}

const PLAYIT_MODES = {
  note:   { title: 'Play the note', icon: '🎯', desc: 'A note name appears. Play it anywhere on the neck.' },
  interval: { title: 'Play the interval', icon: '📏', desc: 'You hear a root. Play the interval asked above it.' },
  chord:  { title: 'Play the chord tone', icon: '🧱', desc: 'Play the root, 3rd, 5th or 7th of a chord.' },
  scale:  { title: 'Play the scale', icon: '🪜', desc: 'Play a scale note by note. The app follows you.' },
};

function PlayItView({ mode = 'note' }) {
  const st = Store.state;
  const root = h('div', { class: 'stack' });
  let listener = null, round = 0, score = 0, target = null, stable = 0, lastPc = null, done = false, pending = false;
  const ROUNDS = mode === 'scale' ? 1 : 10;
  root.appendChild(topBar(PLAYIT_MODES[mode].title, { back: () => { cleanup(); App.go('ear'); } }));
  const head = h('div', { class: 'row between' });
  const promptEl = h('div', { class: 'card hero center stack' });
  const live = h('div', { class: 'card center stack' });
  const liveNote = h('div', { class: 'livenote' }, '–');
  const liveSub = h('div', { class: 'small muted' }, 'Waiting for sound…');
  const meter = h('div', { class: 'meter' }, h('i'));
  live.append(h('div', { class: 'tiny' }, 'You’re playing'), liveNote, liveSub, meter);
  const btns = h('div', { class: 'row' });
  root.append(head, promptEl, live, btns);

  function setHead() {
    head.innerHTML = '';
    head.append(h('div', { class: 'tiny' }, PLAYIT_MODES[mode].title), h('div', { class: 'badge accent' }, mode === 'scale' ? `${score} / ${target ? target.seq.length : 0} notes` : `Round ${Math.min(round + 1, ROUNDS)}/${ROUNDS} · ${score} ✓`));
  }
  const names = ['root', '3rd', '5th', '7th'];
  function newTarget() {
    stable = 0; lastPc = null; pending = false;
    if (mode === 'note') {
      const pc = randInt(0, 11);
      target = { pcs: [pc], text: h('div', null, h('div', { class: 'tiny' }, 'Play any'), h('div', { class: 'notehero' }, bothNames(pc))), reveal: `Any ${bothNames(pc)}: see Index › ${niceName(pc)} › Where.` };
    } else if (mode === 'interval') {
      const iv = pick([3, 4, 5, 7, 10, 12]);
      const r = randInt(45, 55), info = INTERVALS.find(x => x.semi === iv);
      AudioEngine.pluck(r, AudioEngine.now() + 0.05, { gain: 0.4 });
      target = { pcs: [mod12(r + iv)], rootMidi: r, text: h('div', null, h('div', { class: 'tiny' }, `Root: ${noteName(r)} (tap to hear again)`), h('div', { class: 'notehero', style: { fontSize: '40px' } }, `${info.name} above ${noteName(r)}`)), reveal: `${info.name} above ${noteName(r)} = ${noteName(r + iv)}.` };
    } else if (mode === 'chord') {
      const type = pick(['maj', 'min', 'dom7']), rp = randInt(0, 11);
      const iv = CHORD_TYPES[type].iv, idx = randInt(0, iv.length - 1);
      const fl = [3, 8, 10, 5].includes(rp);
      target = { pcs: [mod12(rp + iv[idx])], text: h('div', null, h('div', { class: 'tiny' }, 'Play the'), h('div', { class: 'notehero', style: { fontSize: '44px' } }, `${names[idx]} of ${fullChordName(rp, type).replace(/ \(.*\)/, '')}`)), reveal: `${fullChordName(rp, type).replace(/ \(.*\)/, '')} = ${iv.map(i => noteName(rp + i, fl)).join(' ')}. The ${names[idx]} is ${noteName(rp + iv[idx], fl)}.` };
    }
    renderPrompt();
  }
  function renderPrompt() {
    promptEl.innerHTML = '';
    if (mode === 'scale') {
      const t = target;
      promptEl.append(h('div', { class: 'tiny' }, `${t.key} ${SCALES[t.scale].name} · going up`),
        h('div', { class: 'degrow', style: { justifyContent: 'center' } }, t.seq.map((pc, i) => h('div', { class: 'deg' + (i < score ? ' root' : '') + (i === score ? ' nextdeg' : '') }, h('b', null, t.names[i]), h('small', null, SCALES[t.scale].degrees[i % SCALES[t.scale].degrees.length] || '1')))),
        h('p', { class: 'small muted' }, score < t.seq.length ? `Next note: ${t.names[score]}` : 'Scale complete!'));
      return;
    }
    promptEl.appendChild(target.text);
    if (target.rootMidi) promptEl.onclick = () => AudioEngine.pluck(target.rootMidi, AudioEngine.now(), { gain: 0.4 });
  }
  function onFrame(p) {
    if (done || pending) return;
    meter.firstChild.style.width = Math.min(100, (p ? p.rms : 0) * 900) + '%';
    if (!p || p.silent) { liveSub.textContent = 'Waiting for sound…'; stable = 0; return; }
    if (p.unclear || p.clarity < 0.8) { liveSub.textContent = 'Play one note at a time, let it ring'; return; }
    liveNote.textContent = bothNames(p.pc);
    liveSub.textContent = `${p.cents > 0 ? '+' : ''}${p.cents} cents · ${Math.round(p.freq)} Hz`;
    const want = mode === 'scale' ? [target.seq[score]] : target.pcs;
    if (p.pc === lastPc) stable++; else { stable = 1; lastPc = p.pc; }
    live.classList.toggle('hit', want.includes(p.pc));
    if (stable >= 4 && want.includes(p.pc)) success();
  }
  function success() {
    stable = 0; lastPc = null;
    score++;
    sfx('chime');
    if (mode === 'scale') {
      renderPrompt(); setHead();
      if (score >= target.seq.length) finish();
      pending = true; setTimeout(() => { pending = false; stable = 0; lastPc = null; }, 250);
      return;
    }
    pending = true;
    live.classList.add('flash'); setTimeout(() => live.classList.remove('flash'), 400);
    round++; setHead();
    if (round >= ROUNDS) return finish();
    setTimeout(newTarget, 500);
  }
  function skip() {
    if (done) return;
    if (mode === 'scale') { score++; renderPrompt(); setHead(); if (score >= target.seq.length) finish(); return; }
    UI.toast(target.reveal);
    sfx('nope'); round++; setHead();
    if (round >= ROUNDS) return finish();
    newTarget();
  }
  function finish() {
    done = true;
    listener && listener.stop();
    const total = mode === 'scale' ? target.seq.length : ROUNDS;
    st.playit = st.playit || {}; st.playit[mode] = Math.max(st.playit[mode] || 0, score); st.playit.last = todayStr(); Store.save();
    btns.innerHTML = '';
    live.innerHTML = '';
    live.append(h('div', { style: { fontSize: '48px' } }, score >= total * 0.8 ? '🎸✨' : '🎸'), h('h2', null, `${score} / ${total}`), h('p', { class: 'muted' }, 'The app heard you play. This is how a teacher checks you can really find the notes.'),
      h('div', { class: 'row' }, h('button', { class: 'btn grow', onclick: () => App.go('playit', { mode }) }, 'Again'), h('button', { class: 'btn primary grow', onclick: () => App.go('ear') }, 'Done')));
    if (score) addXP(Math.min(20, score * 2), 'Played it');
    if (score >= total * 0.8) setTimeout(() => confetti(80), 150);
  }
  function cleanup() { done = true; listener && listener.stop(); }

  // intro
  const scalePick = h('div');
  if (mode === 'scale') {
    let key = 'A', scale = 'minorPent';
    const ks = h('select', { onchange: e => key = e.target.value }, KEYS.map(k => h('option', { value: k, selected: k === key ? true : null }, k)));
    const ss = h('select', { onchange: e => scale = e.target.value }, ['minorPent', 'majorPent', 'blues', 'major', 'minor', 'dorian', 'mixolydian'].map(k => h('option', { value: k, selected: k === scale ? true : null }, SCALES[k].name)));
    scalePick.append(h('div', { class: 'row' }, h('div', { class: 'grow' }, h('div', { class: 'tiny' }, 'Key'), ks), h('div', { class: 'grow', style: { flex: 2 } }, h('div', { class: 'tiny' }, 'Scale'), ss)));
    scalePick.getChoice = () => ({ key, scale });
  }
  promptEl.append(h('div', { style: { fontSize: '40px' } }, PLAYIT_MODES[mode].icon), h('p', null, PLAYIT_MODES[mode].desc),
    h('p', { class: 'small muted' }, 'Connect the Pulze Mini (or use the iPhone mic in a quiet room). Play single notes and let them ring.'), scalePick);
  btns.append(h('button', { class: 'btn primary big block', onclick: async () => {
    try {
      AudioEngine.ensure();
      listener = Listener(onFrame);
      await listener.start();
      if (mode === 'scale') {
        const c = scalePick.getChoice(); const rpc = pcOf(c.key);
        const steps = [...SCALES[c.scale].steps, 12];
        const nm = niceName(rpc);
        target = { key: c.key, scale: c.scale, seq: steps.map(s2 => mod12(rpc + s2)), names: steps.map((s2, i) => i === steps.length - 1 ? spell(nm, 0, 0) : spell(nm, s2, degSteps(SCALES[c.scale].degrees[i]))) };
        renderPrompt();
      } else newTarget();
      setHead();
      btns.innerHTML = '';
      btns.append(h('button', { class: 'btn grow', onclick: skip }, mode === 'scale' ? 'Skip note' : 'Skip / show answer'));
    } catch (e) { UI.toast('Could not open the input. Allow microphone access.'); }
  } }, '🎤 Start listening'));
  root.cleanup = cleanup;
  return root;
}

// ---------- Tuner ----------
function TunerView() {
  const root = h('div', { class: 'stack' });
  let listener = null;
  root.appendChild(topBar('Tuner', { back: () => { listener && listener.stop(); App.go('ear'); } }));
  const needle = h('div', { class: 'needle' });
  const noteEl = h('div', { class: 'livenote' }, '–');
  const info = h('div', { class: 'small muted' }, 'Play one open string');
  const strings = h('div', { class: 'row', style: { justifyContent: 'center', gap: '8px' } }, STRINGS.map(s2 => h('span', { class: 'badge' }, s2.label)));
  const dial = h('div', { class: 'dial' }, h('div', { class: 'ticks' }), needle);
  const card = h('div', { class: 'card center stack' }, noteEl, dial, info, strings);
  root.append(card, h('p', { class: 'small muted center' }, 'Standard tuning: E A D G B E. The Pulze Mini also has a built-in tuner.'));
  const startBtn = h('button', { class: 'btn primary big block', onclick: async () => {
    try { AudioEngine.ensure(); listener = Listener(p => {
      if (!p || p.silent || p.unclear) return;
      const near = STRINGS.reduce((b, s2) => Math.abs(s2.midi - p.midi) < Math.abs(b.midi - p.midi) ? s2 : b, STRINGS[0]);
      noteEl.textContent = noteName(p.pc);
      const c = Math.max(-50, Math.min(50, p.cents));
      needle.style.transform = `rotate(${c * 1.4}deg)`;
      const ok = Math.abs(p.cents) <= 5;
      card.classList.toggle('hit', ok);
      info.textContent = ok ? 'In tune ✓' : (p.cents < 0 ? `Too low (${p.cents}¢): tighten` : `Too high (+${p.cents}¢): loosen`);
      [...strings.children].forEach((b, i) => b.classList.toggle('accent', STRINGS[i] === near && p.midi === near.midi));
    }); await listener.start(); startBtn.remove(); } catch (e) { UI.toast('Could not open the input. Allow microphone access.'); }
  } }, '🎤 Start tuner');
  root.appendChild(startBtn);
  root.cleanup = () => listener && listener.stop();
  return root;
}

// ---------- Teacher check after a session recording ----------
const REVIEW_ITEMS = [
  ['time', 'I stayed in time with the backing', 'Timing: practise the next jam 10 BPM slower and count “1 2 3 4” in your head. (Rhythm & Time chapter.)'],
  ['clean', 'My notes sounded clean (no buzz, no extra strings)', 'Clean notes: press right behind the fret, and mute the strings you’re not playing with your free fingers.'],
  ['space', 'I left space between my phrases', 'Space: after each phrase, wait at least one bar. It makes your solo sound much more musical.'],
  ['mission', 'I did what the mission asked', 'Mission: read it again before you start and aim for it in the first 4 bars.'],
];
function teacherCheck(rec) {
  return new Promise(res => {
    const vals = {};
    let handled = false;
    const audio = h('audio', { controls: true, src: URL.createObjectURL(rec.blob), style: { width: '100%' } });
    const rows = REVIEW_ITEMS.map(([k, label]) => { vals[k] = false; return h('div', { class: 'row between' }, h('span', { class: 'small' }, label), toggleEl(false, v => vals[k] = v)); });
    const md = UI.modal(h('div', { class: 'stack' },
      h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, '🎓 Teacher check'),
      h('h2', null, 'Listen back. Be honest.'),
      h('p', { class: 'small muted' }, 'A teacher would ask you these. Tick what was true.'),
      audio, ...rows,
      h('button', { class: 'btn primary block', onclick: async () => {
        handled = true;
        const n = Object.values(vals).filter(Boolean).length;
        rec.review = { ...vals, score: n };
        try { await RecDB.put(rec); } catch (e) {}
        const tips = REVIEW_ITEMS.filter(([k]) => !vals[k]).map(([, , tip]) => tip);
        Store.state.lastTips = tips.slice(0, 2); Store.save();
        md.close();
        if (tips.length) {
          const m2 = UI.modal(h('div', { class: 'stack' }, h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, '🎓 For next time'),
            ...tips.slice(0, 2).map(t => h('div', { class: 'tipbox' }, t)),
            h('button', { class: 'btn primary block', onclick: () => { m2.close(); res(); } }, 'Got it')), { centered: true, onClose: res });
        } else { sfx('sparkle', true); res(); }
      } }, 'Done')), { onClose: () => { if (!handled) res(); } });
  });
}

// ---------- Chapter test ----------
function ChapterTestView({ id }) {
  const ch = CHAPTERS.find(c => c.id === id);
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar(`${ch.title}: test`, { back: () => App.go('chapter', { id }) }));
  const qs = shuffle(ch.lessons.flatMap(l => l.quiz.map(q => q.id))).slice(0, 8);
  root.appendChild(h('div', { class: 'card hero stack' }, h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, '🏁 Chapter test'), h('p', null, `${qs.length} questions from the whole chapter. Score 80% or more to master it.`)));
  root.appendChild(LessonPlayer({ title: 'Chapter test', cards: [], quiz: [] }, { review: qs, doneLabel: 'See result', onDone: ({ correct, total }) => {
    const pass = correct / total >= 0.8;
    if (pass) {
      const first = !Store.state.mastered?.[id];
      Store.state.mastered = { ...(Store.state.mastered || {}), [id]: todayStr() }; Store.save();
      if (first) addXP(50, 'Chapter mastered');
      UI.celebrate('Chapter mastered!', `${ch.title}: ${correct}/${total}`, '⭐');
      App.go('chapter', { id });
    } else {
      const md = UI.modal(h('div', { class: 'stack center' }, h('div', { style: { fontSize: '44px' } }, '💪'), h('h2', null, `${correct} / ${total}`), h('p', { class: 'muted' }, 'Not yet 80%. The questions you missed are now in your reviews. Try again in a day or two.'),
        h('button', { class: 'btn primary block', onclick: () => { md.close(); App.go('chapter', { id }); } }, 'OK')), { centered: true });
    }
  } }));
  return root;
}

// ---------- Teacher's note on the Home screen ----------
function teacherNote() {
  const st = Store.state;
  const due = srsDue().length;
  if (due >= 5) return { text: `You have ${due} things to review. 3 minutes now saves relearning later.`, cta: 'Review now', go: () => App.go('review') };
  const unmastered = CHAPTERS.find(c => c.lessons.length && c.lessons.every(l => st.lessonsDone[l.id]) && !st.mastered?.[c.id]);
  if (unmastered) return { text: `You finished “${unmastered.title}”. Take the chapter test to lock it in.`, cta: 'Take the test', go: () => App.go('chaptertest', { id: unmastered.id }) };
  if (st.lastTips && st.lastTips.length) return { text: st.lastTips[0], cta: 'Jam with this in mind', go: () => App.go('studio') };
  for (let lv = 1; lv <= st.ear.unlocked; lv++) {
    const h2 = st.ear.history[lv] || [], acc = earAccuracy(lv);
    if (h2.length >= 10 && acc < 60) return { text: `Your ear finds “${EAR_LEVELS[lv - 1].name}” hard (${acc}%). One short practice round will help.`, cta: 'Practice', go: () => App.go('earRun', { levels: [lv] }) };
  }
  if (!st.playit || !st.playit.last) return { text: 'New: the app can now hear you. Try “Play the note”: it gives you a note and listens to you find it.', cta: 'Try it', go: () => App.go('playit', { mode: 'note' }) };
  const nl = nextLesson();
  if (nl) return { text: `Next on your path: “${nl.title}” (${nl.chapter.title}). Then record a jam and compare it with an old take.`, cta: 'Open lesson', go: () => App.go('lesson', { id: nl.id }) };
  return { text: 'You’ve done every lesson! Keep recording solos and compare them with your first takes.', cta: 'Studio', go: () => App.go('studio') };
}

// ---------- Recording sync calibration ----------
// The app plays clicks; you hit muted strings on each click. It measures how late your guitar arrives
// compared to when the click was generated, and uses that to line up the backing in your recordings.
function CalibrateView() {
  const st = Store.state;
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Recording sync', { back: () => { stop(); App.go('studio'); } }));
  const status = h('p', { class: 'muted center' }, '');
  const big = h('div', { class: 'livenote', style: { fontSize: '56px' } }, '–');
  const beats = h('div', { class: 'row', style: { justifyContent: 'center' } }, Array.from({ length: 8 }, () => h('i', { class: 'beat' })));
  const card = h('div', { class: 'card center stack' }, big, beats, status);
  let timer = null, active = false;
  const cur = st.settings.syncMs;
  const valLbl = h('b', null, cur != null ? `${cur} ms` : `auto (${AudioEngine.estimatedLatencyMs()} ms)`);
  const slider = h('input', { type: 'range', class: 'slider', min: 0, max: 400, step: 5, value: cur ?? 0, oninput: e => { st.settings.syncMs = +e.target.value; Store.save(); valLbl.textContent = `${st.settings.syncMs} ms`; } });

  root.append(
    h('div', { class: 'card stack' },
      h('h3', null, 'Why your takes can sound late'),
      h('p', { class: 'small muted' }, 'The backing takes a moment to reach your ears, and your guitar takes a moment to come back into the iPhone. In the recording, your playing ends up slightly behind the backing. Measure it once and the app lines them up for you.')),
    h('div', { class: 'card stack' },
      h('h3', null, 'How to measure'),
      h('p', { class: 'small' }, '1. Plug in the Pulze and headphones, exactly like when you record.'),
      h('p', { class: 'small' }, '2. Pick a CLEAN sound on the Pulze (no distortion, delay or reverb) and mute the strings with your fretting hand.'),
      h('p', { class: 'small' }, '3. You’ll hear 4 count-in clicks, then 8 clicks. Strum the muted strings exactly ON each of the 8 clicks.')),
    card,
    h('button', { class: 'btn primary big block', onclick: () => run() }, '⏱ Start measuring'),
    h('div', { class: 'card stack' },
      h('div', { class: 'row between' }, h('span', null, 'Recording sync'), valLbl),
      slider,
      h('p', { class: 'small muted' }, 'Fine-tune by hand: if your guitar still sounds late in the Journal, move it right. If it sounds early, move it left.'),
      h('button', { class: 'btn sm', onclick: () => { st.settings.syncMs = null; Store.save(); valLbl.textContent = `auto (${AudioEngine.estimatedLatencyMs()} ms)`; slider.value = 0; } }, 'Reset to auto')));

  function stop() { active = false; clearInterval(timer); AudioEngine.closeInput(); }

  async function run() {
    if (active) return;
    try {
      AudioEngine.ensure();
      await AudioEngine.openInput(st.settings.inputId);
      AudioEngine.setInputGain(st.settings.inputGain);
      AudioEngine.setMonitor(false);
    } catch (e) { UI.toast('Could not open the input. Allow microphone access.'); return; }
    active = true;
    status.textContent = 'Listening to the room…';
    big.textContent = '…';
    [...beats.children].forEach(x => x.classList.remove('on'));
    // 1) measure the noise floor (RMS)
    const fl = [];
    const t0 = performance.now();
    await new Promise(r => { const iv = setInterval(() => { const b = AudioEngine.inputBuffer(); if (b) { for (let f = 0; f + 128 <= b.data.length; f += 128) { let s2 = 0; for (let i = f; i < f + 128; i++) s2 += b.data[i] * b.data[i]; fl.push(Math.sqrt(s2 / 128)); } } if (performance.now() - t0 > 500) { clearInterval(iv); r(); } }, 20); });
    fl.sort((a, b) => a - b);
    const floor = fl.length ? fl[Math.floor(fl.length * 0.3)] : 0.002; // quiet part of the room/amp noise
    // 2) schedule clicks: 4 count-in + 8 measured, 100 BPM
    const spb = 0.6, start = AudioEngine.now() + 0.4;
    const clicks = [];
    for (let i = 0; i < 12; i++) { const t = start + i * spb; AudioEngine.click(t, i % 4 === 0); if (i >= 4) clicks.push(t); }
    status.textContent = 'Count-in… then strum on every click';
    const hits = [];
    // Onset detection on the energy JUMP, not on a fixed level: works with distortion,
    // reverb or delay on the Pulze, where the sound never really goes quiet between strums.
    const F = 128;
    let lastEnd = 0, slow = floor, lastHit = -1;
    timer = setInterval(() => {
      const b = AudioEngine.inputBuffer(); if (!b) return;
      const N = b.data.length, now = b.end;
      const k = Math.floor((now - clicks[0]) / spb);
      [...beats.children].forEach((x, i) => x.classList.toggle('on', i <= k && k < 8));
      for (let f = 0; f + F <= N; f += F) {
        const fEnd = now - (N - f - F) / b.sr;
        if (fEnd <= lastEnd + 1e-6) continue;
        let s2 = 0, pk = 0;
        for (let i = f; i < f + F; i++) { const v = b.data[i]; s2 += v * v; if (Math.abs(v) > pk) pk = Math.abs(v); }
        const rms = Math.sqrt(s2 / F);
        const fStart = fEnd - F / b.sr;
        if (rms > Math.max(slow * 1.6, floor * 2.5, 0.0015) && fStart - lastHit > 0.25) {
          let idx = f; for (let i = f; i < f + F; i++) if (Math.abs(b.data[i]) > pk * 0.4) { idx = i; break; }
          const onset = now - (N - idx) / b.sr;
          hits.push(onset); lastHit = onset;
          status.textContent = `Strum on every click · heard ${hits.filter(x => x > clicks[0] - 0.15).length}`;
          slow = rms; // the new note becomes the reference so its own sustain doesn't retrigger
        } else {
          slow = slow * 0.9 + rms * 0.1;
        }
        lastEnd = fEnd;
      }
      if (now > clicks[clicks.length - 1] + 0.6) finish(clicks, hits);
    }, 10);
  }
  function finish(clicks, hits) {
    clearInterval(timer); AudioEngine.closeInput(); active = false;
    const lat = [];
    clicks.forEach(c => { const m = hits.filter(x => x > c - 0.1 && x < c + 0.45).sort((a, b) => Math.abs(a - c) - Math.abs(b - c))[0]; if (m !== undefined) lat.push((m - c) * 1000); });
    [...beats.children].forEach(x => x.classList.remove('on'));
    if (lat.length < 5) { big.textContent = '?'; status.textContent = `Only ${lat.length} of 8 strums matched the clicks. Check that the Pulze is selected as the input (Progress › Audio input) and that you strum right on the clicks, then try again.`; sfx('nope'); return; }
    lat.sort((a, b) => a - b);
    const med = Math.max(0, Math.round(lat[Math.floor(lat.length / 2)] / 5) * 5);
    const spread = Math.round(lat[lat.length - 2] - lat[1]);
    st.settings.syncMs = med; Store.save();
    big.textContent = `${med} ms`;
    valLbl.textContent = `${med} ms`; slider.value = med;
    status.textContent = spread > 80 ? `Saved. Your hits were a bit uneven (±${Math.round(spread / 2)} ms), so try once more to be sure.` : 'Saved! Your next recordings will be lined up with the backing.';
    sfx('chime');
  }
  root.cleanup = stop;
  return root;
}
