// ---------- Screens ----------
function dailySeed() { let x = 0; for (const c of todayStr()) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; }
function todaysChallenge() {
  const seed = dailySeed();
  const ch = CHALLENGES[seed % CHALLENGES.length];
  const styles = Object.keys(AudioEngine.STYLES).filter(k => k !== 'metronome' && styleUnlocked(k));
  const style = styles[(seed >> 3) % styles.length];
  const key = ch.randomKey ? ['F#','Bb','Eb','C#','Ab','B','F'][(seed >> 5) % 7] : ['A','E','G','D','C'][(seed >> 5) % 5];
  return { ch, cfg: { style, key, bpm: ch.bpm || AudioEngine.STYLES[style].bpm, prompt: ch.text, challenge: ch.title, target: !!ch.target, tone: ch.toneHint, title: 'Challenge: ' + ch.title } };
}

function topBar(title, { back, right } = {}) {
  return h('div', { class: 'topbar' },
    h('div', { class: 'row grow' },
      back ? h('button', { class: 'iconbtn', onclick: back, 'aria-label': 'Back' }, icon('back')) : null,
      h('h1', { class: 'grow', style: back ? { fontSize: '22px' } : null }, title)),
    right || null);
}
function levelChip() {
  const li = levelInfo();
  return h('button', { class: 'levelchip', onclick: () => App.go('progress') }, h('span', { class: 'lv' }, li.lvl), `${Store.state.xp} XP`);
}
function weekDots() {
  const goal = Store.state.settings.weeklyGoal, done = sessionsThisWeek();
  const n = Math.max(goal, done);
  return h('div', { class: 'weekdots' }, Array.from({ length: n }, (_, i) => h('i', { class: i < done ? 'on' : '' }, i < done ? '✓' : '')));
}

// ---------- HOME ----------
function HomeView() {
  const st = Store.state;
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Woodshed', { right: levelChip() }));

  const days = daysSinceLastSession();
  const done = sessionsThisWeek(), goal = st.settings.weeklyGoal;
  let greet;
  if (days === null) greet = 'Welcome! Tap Play and the app will give you something to do.';
  else if (done >= goal) greet = `Week goal reached 🎉 Anything extra is a bonus.`;
  else if (days >= 4) greet = `It’s been ${days} days. Your guitar misses you, even 10 minutes counts!`;
  else greet = `${goal - done} session${goal - done > 1 ? 's' : ''} left to hit this week’s goal.`;

  let minutes = st.lastMinutes || 20;
  let mode = st.homeMode || 'play';
  const nl = nextLesson();
  const hero = h('div', { class: 'card hero stack' });
  function renderHero() {
    hero.innerHTML = '';
    const seg = h('div', { class: 'seg' },
      h('button', { class: mode === 'play' ? 'on' : '', onclick: () => { mode = 'play'; st.homeMode = mode; Store.save(); renderHero(); } }, '🎸 Let’s play'),
      h('button', { class: mode === 'browse' ? 'on' : '', onclick: () => { mode = 'browse'; st.homeMode = mode; Store.save(); renderHero(); } }, '👀 Just dropping by'));
    hero.appendChild(seg);
    if (mode === 'play') {
      const durChips = h('div', { class: 'chips' });
      [10, 20, 40].forEach(m => durChips.appendChild(h('button', { class: 'chip' + (m === minutes ? ' on' : ''), onclick: () => { minutes = m; st.lastMinutes = m; Store.save(); renderHero(); } }, `${m} min`)));
      hero.append(
        h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, 'How much time do you have?'),
        durChips,
        h('button', { class: 'btn primary big block', onclick: () => App.go('session', { minutes }) }, icon('play', 22), ' Play'),
        h('p', { class: 'small muted' }, nl ? `Next up: ${nl.chapter.title} › ${nl.title}` : 'All lessons done: sessions will mix reviews and jams.'));
    } else {
      const earDone = st.ear.dailyDate === todayStr();
      const due = srsDue().length;
      const tiles = [
        ['👂', 'Ear quiz', earDone ? 'done today ✓' : '+15 XP', () => App.go('earRun', { daily: !earDone })],
        ['🎙️', 'My takes', 'listen back', () => App.go('journal')],
        ['🎛️', 'Free jam', 'backing tracks', () => App.go('studio')],
        ['📖', 'Lessons', due ? `${due} to review` : 'browse', () => App.go(due >= 3 ? 'review' : 'learn')],
        ['🎁', 'Surprise', st.surpriseDone === todayStr() ? 'done ✓' : '+25 XP', () => App.go('challenge')],
        ['📈', 'Progress', `level ${levelInfo().lvl}`, () => App.go('progress')],
      ];
      hero.append(
        h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, 'No pressure. Pick anything:'),
        h('div', { class: 'tiles' }, tiles.map(([e, t, sub, fn]) => h('button', { class: 'tile', onclick: fn }, h('span', { class: 'bubble' }, e), h('b', null, t), h('small', null, sub)))),
        h('p', { class: 'small muted' }, 'Dropping by doesn’t count as a session, but quizzes and challenges still give XP.'));
    }
  }
  renderHero();
  root.appendChild(hero);

  root.appendChild(h('div', { class: 'card stack' },
    h('div', { class: 'row between' }, h('div', null, h('div', { class: 'tiny' }, 'This week'), h('h3', null, `${done} / ${goal} sessions`)),
      h('div', { class: 'badge accent' }, `🔥 ${weekStreak()} week streak`)),
    weekDots(),
    h('p', { class: 'small muted' }, greet)));

  const due = srsDue();
  if (due.length >= 3) root.appendChild(h('div', { class: 'card tap row', onclick: () => App.go('review') },
    h('div', { style: { fontSize: '26px' } }, '🔁'), h('div', { class: 'grow' }, h('h3', null, `${due.length} cards to review`), h('p', { class: 'small muted' }, 'Quick quiz on things you’re forgetting.')), icon('back', 18)));

  const earDone = st.ear.dailyDate === todayStr();
  root.appendChild(h('div', { class: 'card tap row' + (earDone ? ' dim' : ''), onclick: () => App.go('earRun', { daily: true }) },
    h('div', { style: { fontSize: '26px' } }, '👂'),
    h('div', { class: 'grow' }, h('h3', null, 'Daily ear challenge'), h('p', { class: 'small muted' }, earDone ? `Done today: ${st.ear.dailyScore}/10. New one tomorrow.` : '2 minutes, no guitar needed. +15 XP bonus.')),
    earDone ? h('span', { class: 'badge good' }, '✓') : h('span', { class: 'badge accent' }, '+15')));

  const { ch } = todaysChallenge();
  const chDone = st.surpriseDone === todayStr();
  root.appendChild(h('div', { class: 'card tap row' + (chDone ? ' dim' : ''), onclick: () => App.go('challenge') },
    h('div', { style: { fontSize: '26px' } }, '🎁'),
    h('div', { class: 'grow' }, h('div', { class: 'tiny' }, 'Surprise of the day'), h('h3', null, ch.title), h('p', { class: 'small muted' }, chDone ? 'Done! A new surprise tomorrow.' : ch.text)),
    chDone ? h('span', { class: 'badge good' }, '✓') : h('span', { class: 'badge accent' }, '+25')));

  // next unlock
  const nextUnlock = Object.values(AudioEngine.STYLES).filter(s => s.xp > st.xp).sort((a, b) => a.xp - b.xp)[0];
  if (nextUnlock) {
    const prevXp = Math.max(0, ...Object.values(AudioEngine.STYLES).filter(s => s.xp <= st.xp).map(s => s.xp));
    root.appendChild(h('div', { class: 'card stack' },
      h('div', { class: 'row between' }, h('div', { class: 'tiny' }, 'Next unlock'), h('span', { class: 'small muted' }, `${st.xp} / ${nextUnlock.xp} XP`)),
      h('h3', null, `🎵 ${nextUnlock.name} backing track`),
      h('div', { class: 'bar' }, h('i', { style: { width: Math.round(100 * (st.xp - prevXp) / (nextUnlock.xp - prevXp)) + '%' } }))));
  }
  return root;
}

// ---------- SESSION ----------
function SessionView({ minutes }) {
  const st = Store.state;
  const fresh = nextLesson();
  const lesson = fresh || pick(ALL_LESSONS);
  const due = srsDue();
  const durs = [Math.max(2, Math.round(minutes * 0.25)), Math.max(4, Math.round(minutes * 0.35))];
  durs.push(Math.max(4, minutes - durs[0] - durs[1]));
  const names = ['Theory', 'On the neck', 'Improvise & record'];
  let idx = 0, blockStart = Date.now(), child = null, tmr = null;
  const startedAt = Date.now();
  const root = h('div', { class: 'stack' });
  const head = h('div', { class: 'stack' });
  const body = h('div');
  root.append(head, body);

  function header() {
    head.innerHTML = '';
    const left = durs[idx] * 60 - (Date.now() - blockStart) / 1000;
    head.append(
      h('div', { class: 'row between' },
        h('button', { class: 'iconbtn', onclick: exit, 'aria-label': 'Exit' }, icon('close')),
        h('div', { class: 'center grow' }, h('div', { class: 'tiny' }, `Block ${Math.min(idx + 1, 3)} of 3 · ${minutes} min session`), h('h3', null, idx < 3 ? names[idx] : 'Session complete')),
        h('div', { class: 'timer', style: { minWidth: '44px', textAlign: 'right', color: left < 0 ? 'var(--accent)' : 'var(--text)' } }, idx < 3 ? (left > 0 ? fmtTime(left) : '⏰') : '')),
      h('div', { class: 'blockhead' }, [0, 1, 2].map(i => h('i', { class: i < idx ? 'done' : i === idx ? 'on' : '' }))),
      ...(idx < 3 && left < 0 ? [h('p', { class: 'small center', style: { color: 'var(--accent)' } }, 'Time’s up for this block. Move on when you’re ready.')] : []));
  }
  async function exit() {
    if (await UI.confirm('Leave this session?', 'It won’t count toward your weekly goal.', 'Leave', true)) { cleanup(); App.go('home'); }
  }
  function cleanup() { clearInterval(tmr); child && child.cleanup && child.cleanup(); }
  function nextBlock() { child && child.cleanup && child.cleanup(); idx++; blockStart = Date.now(); render(); window.scrollTo(0, 0); }

  function render() {
    header();
    body.innerHTML = '';
    if (idx === 0) {
      const intro = h('div', { class: 'stack' },
        h('div', { class: 'card stack' }, h('div', { class: 'tiny' }, fresh ? 'New lesson' : 'Review'), h('h2', null, fresh ? lesson.title : 'Refresh what you learned'), h('p', { class: 'small muted' }, `${lesson.chapter.icon} ${lesson.chapter.title}`)));
      const reviewIds = fresh ? null : (due.length ? due.slice(0, 6) : lesson.quiz.map(q => q.id));
      child = LessonPlayer(lesson, { review: reviewIds, onDone: nextBlock, doneLabel: 'Next block →' });
      intro.appendChild(child);
      body.appendChild(intro);
    } else if (idx === 1) {
      const p = lesson.practice;
      child = p.type === 'game' ? GameView(p, nextBlock) : DrillView(p, lesson.id, nextBlock);
      body.appendChild(child);
    } else if (idx === 2) {
      const finishNoRec = h('button', { class: 'btn ghost block small', onclick: async () => {
        if (await UI.confirm('Finish without a recording?', 'You get a little XP, but the session won’t count for your weekly goal. A recording is your proof!', 'Finish anyway')) complete(false);
      } }, 'Finish without recording');
      child = StudioView({ ...lesson.jam, lessonId: lesson.id, title: `${lesson.title}: jam` }, { mode: 'session', onSaved: () => complete(true), footer: finishNoRec });
      body.appendChild(child);
    } else {
      body.appendChild(summary);
    }
  }
  let summary = null;
  function complete(counted) {
    child && child.cleanup && child.cleanup();
    clearInterval(tmr);
    const realMin = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    st.sessions.push({ date: new Date().toISOString(), minutes: realMin, lessonId: lesson.id, counted });
    Store.save();
    const wk = weekKey();
    const reached = counted && sessionsThisWeek() >= st.settings.weeklyGoal && !st.weekBonus[wk];
    idx = 3;
    summary = h('div', { class: 'card center stack' },
      h('div', { style: { fontSize: '56px' } }, counted ? '🎸' : '👋'),
      h('h1', null, counted ? 'Session done!' : 'See you soon'),
      h('p', { class: 'muted' }, counted ? `${realMin} minute${realMin > 1 ? 's' : ''} of real practice. Your take is in the Journal.` : 'Next time, record a take so it counts.'),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, weekDots()),
      h('p', { class: 'small muted' }, `${sessionsThisWeek()} / ${st.settings.weeklyGoal} this week · 🔥 ${weekStreak()} week streak`),
      h('button', { class: 'btn primary block', onclick: () => App.go('home') }, 'Back home'));
    render();
    addXP(counted ? 40 + realMin : 10, counted ? 'Session complete' : 'Session');
    if (counted) setTimeout(() => confetti(120), 200);
    if (reached) { st.weekBonus[wk] = true; Store.save(); setTimeout(() => { addXP(40, 'Weekly goal'); UI.celebrate('Week goal reached!', `+40 XP bonus. ${weekStreak()} week streak.`, '🔥'); }, 900); }
  }
  render();
  tmr = setInterval(() => { if (idx < 3) header(); }, 1000);
  root.cleanup = cleanup;
  return root;
}

// ---------- LEARN ----------
function LearnView() {
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Learn', { right: levelChip() }));
  const doneN = ALL_LESSONS.filter(l => Store.state.lessonsDone[l.id]).length;
  root.appendChild(h('div', { class: 'card hero stack' },
    h('div', { class: 'row between' }, h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, 'Your path'), h('span', { class: 'small muted' }, `${doneN} / ${ALL_LESSONS.length} lessons`)),
    h('div', { class: 'bar' }, h('i', { style: { width: (100 * doneN / ALL_LESSONS.length) + '%' } })),
    h('p', { class: 'small muted' }, 'By the end you’ll be able to:'),
    h('div', { class: 'chips' }, ['find any note', 'read diagrams & tabs', 'decode any chord name', 'count rhythm', 'hear intervals', 'build scales & chords', 'find a song’s key', 'use the circle of 5ths', 'play CAGED shapes', 'target chord tones', 'use modes', 'build a real solo'].map(x => h('span', { class: 'badge' }, '✓ ' + x)))));
  const due = srsDue();
  if (due.length) root.appendChild(h('div', { class: 'card tap row', onclick: () => App.go('review') },
    h('div', { style: { fontSize: '26px' } }, '🔁'), h('div', { class: 'grow' }, h('h3', null, `Review (${due.length})`), h('p', { class: 'small muted' }, 'Spaced repetition: what you miss comes back more often.'))));
  CHAPTERS.forEach((ch, i) => {
    const unlocked = (chapterUnlocked(i) || (Store.state.skipped || {})[ch.id]) && !ch.soon;
    const p = chapterProgress(ch);
    root.appendChild(h('div', { class: 'card chapter tap' + (unlocked ? '' : ' dim'), onclick: () => {
      if (ch.soon) return UI.toast('Coming in a future version');
      if (!unlocked) {
        UI.confirm('Skip ahead?', 'This chapter normally opens when you finish half of the previous one. Already know that stuff? You can open it now.', 'Open it').then(ok => { if (ok) { Store.state.skipped = { ...(Store.state.skipped || {}), [ch.id]: true }; Store.save(); App.go('chapter', { id: ch.id }); } });
        return;
      }
      App.go('chapter', { id: ch.id });
    } },
      h('div', { class: 'row' }, h('div', { class: 'num' }, unlocked ? ch.icon : '🔒'),
        h('div', { class: 'grow' }, h('div', { class: 'tiny' }, `Chapter ${i + 1}`), h('h3', null, ch.title), h('p', { class: 'small muted' }, ch.blurb))),
      ch.soon ? h('div', { class: 'badge', style: { marginTop: '10px' } }, 'Coming soon') :
        h('div', { class: 'row', style: { marginTop: '12px' } }, h('div', { class: 'bar good grow' }, h('i', { style: { width: (p.total ? 100 * p.done / p.total : 0) + '%' } })), h('span', { class: 'small muted' }, `${p.done}/${p.total}`))));
  });
  return root;
}
function ChapterView({ id }) {
  const ch = CHAPTERS.find(c => c.id === id);
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar(ch.title, { back: () => App.go('learn') }));
  root.appendChild(h('p', { class: 'muted' }, ch.blurb));
  root.appendChild(h('div', { class: 'card' }, ch.lessons.map((l, i) => {
    const done = !!Store.state.lessonsDone[l.id];
    return h('div', { class: 'lessonrow tap', style: { cursor: 'pointer' }, onclick: () => App.go('lesson', { id: l.id }) },
      h('div', { class: 'check' + (done ? ' on' : '') }, done ? '✓' : i + 1),
      h('div', { class: 'grow' }, h('h3', null, l.title), h('p', { class: 'small muted' }, `${l.cards.length} cards · ${l.quiz.length} questions · ${l.practice.type === 'game' ? 'game' : 'drill'}`)),
      icon('back', 16));
  })));
  return root;
}
function LessonView({ id }) {
  const l = LESSON_BY_ID[id];
  let tab = 'learn', child = null;
  const root = h('div', { class: 'stack' });
  const body = h('div');
  const seg = h('div', { class: 'chips' });
  function render() {
    child && child.cleanup && child.cleanup();
    seg.innerHTML = '';
    [['learn', 'Learn'], ['practice', 'Practice'], ['jam', 'Jam']].forEach(([k, lbl]) => seg.appendChild(h('button', { class: 'chip' + (tab === k ? ' on' : ''), onclick: () => { tab = k; render(); } }, lbl)));
    body.innerHTML = '';
    if (tab === 'learn') child = LessonPlayer(l, { onDone: () => { tab = 'practice'; render(); }, doneLabel: 'Practice it →' });
    else if (tab === 'practice') child = l.practice.type === 'game' ? GameView(l.practice, () => { tab = 'jam'; render(); }) : DrillView(l.practice, l.id, () => { tab = 'jam'; render(); });
    else child = StudioView({ ...l.jam, lessonId: l.id, title: `${l.title}: jam` }, { mode: 'lesson' });
    body.appendChild(child);
  }
  root.append(topBar(l.title, { back: () => { child && child.cleanup && child.cleanup(); App.go('chapter', { id: l.chapter.id }); } }), seg, body);
  render();
  root.cleanup = () => child && child.cleanup && child.cleanup();
  return root;
}
function ReviewView() {
  const due = srsDue().slice(0, 10);
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Review', { back: () => App.go('learn') }));
  if (!due.length) { root.appendChild(h('div', { class: 'card center' }, h('p', null, 'Nothing to review right now 🎉'))); return root; }
  const fakeLesson = { title: 'Review', cards: [], quiz: [] };
  root.appendChild(LessonPlayer(fakeLesson, { review: due, onDone: () => App.go('home'), doneLabel: 'Done' }));
  return root;
}

// ---------- EAR ----------
function EarView() {
  const st = Store.state;
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Ear training', { right: levelChip() }));
  const earDone = st.ear.dailyDate === todayStr();
  root.appendChild(h('div', { class: 'card hero stack' },
    h('div', { class: 'tiny', style: { color: 'var(--accent2)' } }, 'Daily challenge'),
    h('h2', null, earDone ? `Done today: ${st.ear.dailyScore}/10` : '10 questions · ~2 min'),
    h('p', { class: 'small muted' }, 'Major/minor, chord names (G, A, Em…), single notes and your current level. Use headphones or the Pulze.'),
    h('button', { class: 'btn primary block', onclick: () => App.go('earRun', { daily: !earDone }) }, earDone ? 'Practice more' : 'Start (+15 XP)')));
  const accC = earAccuracy('C');
  root.appendChild(h('div', { class: 'card stack' },
    h('div', { class: 'row' },
      h('span', { class: 'bubble', style: { width: '44px', height: '44px', fontSize: '20px' } }, '🎸'),
      h('div', { class: 'grow' }, h('h3', null, 'Name the chord'), h('p', { class: 'small muted' }, 'Common chords: C, D, E, F, G, A, B, Am, Em, Dm, Bm.')),
      h('button', { class: 'btn sm', onclick: () => App.go('earRun', { levels: ['C'] }) }, 'Practice')),
    h('div', { class: 'row' }, h('div', { class: 'bar good grow' }, h('i', { style: { width: (accC || 0) + '%' } })), h('span', { class: 'small muted' }, accC === null ? 'no data' : `${accC}% (last 20)`)),
    st.ear.typedAvail?.['C'] ? h('div', { class: 'row between' }, h('span', { class: 'small' }, '⌨️ Typed answers (harder)'), toggleEl(!!st.ear.typed['C'], v => { st.ear.typed['C'] = v; Store.save(); })) : h('p', { class: 'small muted' }, 'Typed answers unlock at 80% here.')));
  const accN = earAccuracy('N');
  root.appendChild(h('div', { class: 'card stack' },
    h('div', { class: 'row' },
      h('span', { class: 'bubble', style: { width: '44px', height: '44px', fontSize: '20px' } }, '🎵'),
      h('div', { class: 'grow' }, h('h3', null, 'Name the note'), h('p', { class: 'small muted' }, 'A single note, no reference. The hardest one, and it’s fine to guess!')),
      h('button', { class: 'btn sm', onclick: () => App.go('earRun', { levels: ['N'] }) }, 'Practice')),
    h('div', { class: 'row' }, h('div', { class: 'bar good grow' }, h('i', { style: { width: (accN || 0) + '%' } })), h('span', { class: 'small muted' }, accN === null ? 'no data' : `${accN}% (last 20)`)),
    st.ear.typedAvail?.['N'] ? h('div', { class: 'row between' }, h('span', { class: 'small' }, '⌨️ Typed answers (harder)'), toggleEl(!!st.ear.typed['N'], v => { st.ear.typed['N'] = v; Store.save(); })) : h('p', { class: 'small muted' }, 'Typed answers unlock at 80% here.')));
  EAR_LEVELS.forEach(L => {
    const unlocked = L.id <= st.ear.unlocked;
    const acc = earAccuracy(L.id);
    const typedAvail = st.ear.typedAvail?.[L.id];
    const card = h('div', { class: 'card stack' + (unlocked ? '' : ' dim') },
      h('div', { class: 'row' },
        h('div', { class: 'num', style: { width: '40px', height: '40px', borderRadius: '12px', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 } }, unlocked ? L.id : '🔒'),
        h('div', { class: 'grow' }, h('h3', null, L.name), h('p', { class: 'small muted' }, L.desc)),
        unlocked ? h('button', { class: 'btn sm', onclick: () => App.go('earRun', { levels: [L.id] }) }, 'Practice') : null),
      unlocked ? h('div', { class: 'row' }, h('div', { class: 'bar good grow' }, h('i', { style: { width: (acc || 0) + '%' } })), h('span', { class: 'small muted' }, acc === null ? 'no data' : `${acc}% (last 20)`)) :
        h('p', { class: 'small muted' }, 'Unlocks at 80% on the previous level (last 20 answers).'),
      typedAvail ? h('div', { class: 'row between' }, h('span', { class: 'small' }, '⌨️ Typed answers (harder)'), toggleEl(!!st.ear.typed[L.id], v => { st.ear.typed[L.id] = v; Store.save(); })) :
        (unlocked ? h('p', { class: 'small muted' }, 'Typed answers unlock at 80% here.') : null));
    root.appendChild(card);
  });
  return root;
}
function EarRunView({ daily = false, levels }) {
  const st = Store.state;
  let lv = levels;
  if (!lv) { const u = st.ear.unlocked; lv = u === 1 ? [1, 1, 'C', 'C', 'N'] : [u, u, u - 1, Math.max(1, u - 2), 'C', 'C', 'N']; }
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar(daily ? 'Daily ear challenge' : 'Ear practice', { back: () => App.go('ear') }));
  const run = EarRun({ levels: lv, count: 10, daily, onDone: () => App.go(daily ? 'home' : 'ear') });
  root.appendChild(h('div', { class: 'card stack center' }, h('div', { style: { fontSize: '48px' } }, '🎧'), h('p', { class: 'muted' }, 'Each question plays automatically. You can replay it as often as you like.'),
    h('button', { class: 'btn primary big block', onclick: e => { e.currentTarget.parentElement.remove(); root.appendChild(run); run.start(); } }, 'Start')));
  return root;
}

// ---------- STUDIO / CHALLENGE ----------
function StudioScreen(params = {}) {
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Studio', { right: levelChip() }));
  const cfg = {};
  if (params.key) cfg.key = params.key;
  if (params.scale) cfg.scale = params.scale;
  const sv = StudioView(cfg, { mode: 'studio' });
  root.appendChild(sv);
  root.cleanup = sv.cleanup;
  return root;
}
function ChallengeView() {
  const { cfg } = todaysChallenge();
  const root = h('div', { class: 'stack' });
  let sv;
  root.appendChild(topBar('Surprise', { back: () => { sv.cleanup(); App.go('home'); } }));
  sv = StudioView(cfg, { mode: 'challenge', onSaved: () => {
    if (Store.state.surpriseDone !== todayStr()) { Store.state.surpriseDone = todayStr(); Store.save(); addXP(25, 'Surprise challenge'); }
  } });
  root.appendChild(sv);
  root.cleanup = sv.cleanup;
  return root;
}

// ---------- JOURNAL ----------
function JournalView() {
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Journal', { right: levelChip() }));
  const list = h('div', { class: 'list' }, h('p', { class: 'muted' }, 'Loading…'));
  let filter = 'all', compare = false, selected = [];
  const player = new Audio();
  let playingId = null, urlCache = {};
  const filters = h('div', { class: 'chips' });
  const cmpPanel = h('div');
  root.append(filters, cmpPanel, list);
  let recs = [];

  function urlFor(r) { return urlCache[r.id] || (urlCache[r.id] = URL.createObjectURL(r.blob)); }
  function renderFilters() {
    filters.innerHTML = '';
    [['all', 'All'], ['fav', '♥ Favourites'], ['session', 'Sessions'], ['challenge', 'Challenges']].forEach(([k, l]) =>
      filters.appendChild(h('button', { class: 'chip' + (filter === k ? ' on' : ''), onclick: () => { filter = k; renderList(); renderFilters(); } }, l)));
    filters.appendChild(h('button', { class: 'chip' + (compare ? ' on' : ''), onclick: () => { compare = !compare; selected = []; renderFilters(); renderList(); renderCompare(); } }, '⇄ Then vs now'));
  }
  function play(r, btn, seekBar) {
    if (playingId === r.id && !player.paused) { player.pause(); return; }
    player.src = urlFor(r); playingId = r.id;
    player.play().catch(e => UI.toast('Playback failed: ' + e.message));
    document.querySelectorAll('.rec .play').forEach(b => { b.innerHTML = ''; b.appendChild(icon('play', 20)); });
    btn.innerHTML = ''; btn.appendChild(icon('pause', 20));
    player.ontimeupdate = () => { seekBar.style.width = (100 * player.currentTime / (player.duration && isFinite(player.duration) ? player.duration : r.duration)) + '%'; };
    player.onpause = player.onended = () => { btn.innerHTML = ''; btn.appendChild(icon('play', 20)); };
  }
  function renderCompare() {
    cmpPanel.innerHTML = '';
    if (!compare) return;
    const [a, b] = selected.map(id => recs.find(r => r.id === id));
    cmpPanel.appendChild(h('div', { class: 'card stack' },
      h('div', { class: 'tiny' }, 'Then vs now'),
      h('p', { class: 'small muted' }, a && b ? 'Listen to both and hear your progress.' : 'Select two takes below (ideally an old one and a recent one).'),
      a && b ? h('div', { class: 'grid2' },
        [a, b].map(r => { const sb = h('i'); const btn = h('button', { class: 'play', style: { margin: '0 auto' } }, icon('play', 20)); btn.onclick = () => play(r, btn, sb);
          return h('div', { class: 'rec stat center stack' }, h('div', { class: 'tiny' }, fmtDate(r.createdAt)), h('div', { class: 'small' }, r.title), btn, h('div', { class: 'seek' }, sb)); })) : null));
  }
  function renderList() {
    list.innerHTML = '';
    let rs = recs;
    if (filter === 'fav') rs = rs.filter(r => r.fav);
    if (filter === 'session') rs = rs.filter(r => r.ctx?.source === 'session');
    if (filter === 'challenge') rs = rs.filter(r => r.ctx?.source === 'challenge');
    if (!rs.length) { list.appendChild(h('div', { class: 'card center stack' }, h('div', { style: { fontSize: '40px' } }, '🎙️'), h('p', { class: 'muted' }, recs.length ? 'Nothing here with this filter.' : 'No recordings yet. Play a session or open the Studio and hit record.'))); return; }
    let lastMonth = '';
    rs.forEach(r => {
      const month = new Date(r.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      if (month !== lastMonth) { list.appendChild(h('div', { class: 'tiny', style: { marginTop: '16px' } }, month)); lastMonth = month; }
      const seekBar = h('i');
      const btn = h('button', { class: 'play', 'aria-label': 'Play' }, icon('play', 20));
      btn.onclick = e => { e.stopPropagation(); play(r, btn, seekBar); };
      const sel = selected.includes(r.id);
      const card = h('div', { class: 'card rec' + (sel ? ' sel' : ''), onclick: () => {
        if (!compare) return;
        if (sel) selected = selected.filter(x => x !== r.id); else selected = [...selected, r.id].slice(-2);
        renderList(); renderCompare();
      } },
        h('div', { class: 'row' }, btn,
          h('div', { class: 'grow' }, h('h3', { style: { fontSize: '16px' } }, (r.fav ? '♥ ' : '') + r.title),
            h('p', { class: 'small muted' }, `${fmtDate(r.createdAt)} · ${fmtTime(r.duration)}${r.ctx?.key ? ' · ' + r.ctx.key : ''}${r.ctx?.bpm ? ' · ' + r.ctx.bpm + ' BPM' : ''}`),
            r.tone ? h('p', { class: 'small', style: { color: 'var(--accent2)' } }, '🎛 ' + r.tone) : null)),
        h('div', { class: 'seek' }, seekBar),
        compare ? h('p', { class: 'small', style: { marginTop: '8px', color: sel ? 'var(--blue)' : 'var(--muted)' } }, sel ? '✓ Selected for comparison' : 'Tap to select') :
          h('div', { class: 'row', style: { marginTop: '10px', gap: '6px' } },
            h('button', { class: 'btn sm', onclick: async () => { r.fav = !r.fav; await RecDB.put(r); renderList(); } }, r.fav ? '♥ Unfav' : '♡ Fav'),
            h('button', { class: 'btn sm', onclick: async () => { const t = await UI.prompt('Rename take', r.title); if (t) { r.title = t; await RecDB.put(r); renderList(); } } }, 'Rename'),
            h('button', { class: 'btn sm', onclick: () => shareRec(r) }, 'Share'),
            h('div', { class: 'grow' }),
            h('button', { class: 'btn sm danger', onclick: async () => { if (await UI.confirm('Delete this take?', `“${r.title}” will be gone for good.`, 'Delete', true)) { await RecDB.del(r.id); recs = recs.filter(x => x.id !== r.id); renderList(); } } }, 'Delete')));
      list.appendChild(card);
    });
  }
  async function shareRec(r) {
    const ext = (r.mime || '').includes('mp4') ? 'm4a' : (r.mime || '').includes('ogg') ? 'ogg' : 'webm';
    const name = r.title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') + '.' + ext;
    const file = new File([r.blob], name, { type: r.mime || 'audio/mp4' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: r.title }); return; }
    } catch (e) { if (e.name === 'AbortError') return; }
    const a = h('a', { href: urlFor(r), download: name }); document.body.appendChild(a); a.click(); a.remove();
  }
  renderFilters();
  RecDB.all().then(rs => { recs = rs; renderList(); }).catch(e => { list.innerHTML = ''; list.appendChild(h('p', { class: 'muted' }, 'Could not open storage: ' + e.message)); });
  root.cleanup = () => { player.pause(); Object.values(urlCache).forEach(u => URL.revokeObjectURL(u)); };
  return root;
}

// ---------- PROGRESS & SETTINGS ----------
function ProgressView() {
  const st = Store.state;
  const li = levelInfo();
  const root = h('div', { class: 'stack' });
  root.appendChild(topBar('Progress', { back: () => App.go('home') }));
  const C = 2 * Math.PI * 52;
  root.appendChild(h('div', { class: 'card row', style: { gap: '18px' } },
    h('div', { class: 'ring' }, (() => { const sv = s('svg', { width: 120, height: 120, viewBox: '0 0 120 120' }, s('circle', { cx: 60, cy: 60, r: 52, fill: 'none', stroke: '#3a322b', 'stroke-width': 10 }), s('circle', { cx: 60, cy: 60, r: 52, fill: 'none', stroke: '#f2a541', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': `${C * li.into / li.need} ${C}` })); return sv; })(),
      h('div', { class: 'lbl' }, h('div', { class: 'tiny' }, 'Level'), h('div', { style: { fontSize: '34px', fontWeight: 850 } }, li.lvl))),
    h('div', { class: 'grow' }, h('h2', null, li.title), h('p', { class: 'small muted' }, `${st.xp} XP total · ${li.need - li.into} XP to level ${li.lvl + 1}`))));
  const counted = st.sessions.filter(x => x.counted);
  const mins = counted.reduce((a, b) => a + b.minutes, 0);
  const lessonsDone = Object.keys(st.lessonsDone).length;
  root.appendChild(h('div', { class: 'grid2' },
    h('div', { class: 'stat' }, h('b', null, `🔥 ${weekStreak()}`), h('span', { class: 'small muted' }, 'week streak')),
    h('div', { class: 'stat' }, h('b', null, `${sessionsThisWeek()}/${st.settings.weeklyGoal}`), h('span', { class: 'small muted' }, 'this week')),
    h('div', { class: 'stat' }, h('b', null, counted.length), h('span', { class: 'small muted' }, 'sessions')),
    h('div', { class: 'stat' }, h('b', null, `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`), h('span', { class: 'small muted' }, 'practised')),
    h('div', { class: 'stat' }, h('b', null, `${lessonsDone}/${ALL_LESSONS.length}`), h('span', { class: 'small muted' }, 'lessons')),
    h('div', { class: 'stat' }, h('b', null, `L${st.ear.unlocked}`), h('span', { class: 'small muted' }, 'ear level'))));

  root.appendChild(h('div', { class: 'card stack' }, h('div', { class: 'tiny' }, 'Backing tracks'),
    Object.values(AudioEngine.STYLES).map(sv => h('div', { class: 'row between' }, h('span', null, (st.xp >= sv.xp ? '🎵 ' : '🔒 ') + sv.name), h('span', { class: 'small muted' }, st.xp >= sv.xp ? 'unlocked' : `${sv.xp} XP`)))));

  // settings
  const set = st.settings;
  const goalChips = h('div', { class: 'chips' });
  const renderGoal = () => { goalChips.innerHTML = ''; [1, 2, 3, 4].forEach(n => goalChips.appendChild(h('button', { class: 'chip' + (set.weeklyGoal === n ? ' on' : ''), onclick: () => { set.weeklyGoal = n; Store.save(); renderGoal(); } }, `${n}× / week`))); };
  renderGoal();
  const inputSel = h('select', { onchange: e => { set.inputId = e.target.value; Store.save(); } }, h('option', { value: '' }, 'Default input'));
  async function fillInputs() {
    const ins = await AudioEngine.listInputs();
    inputSel.innerHTML = '';
    inputSel.appendChild(h('option', { value: '' }, 'Default input (auto)'));
    ins.forEach((d, i) => inputSel.appendChild(h('option', { value: d.deviceId, selected: d.deviceId === set.inputId ? true : null }, d.label || `Input ${i + 1}`)));
  }
  fillInputs();
  const gainLbl = h('span', { class: 'small muted' }, `${Math.round(set.inputGain * 100)}%`);
  const recLbl = h('span', { class: 'small muted' }, `${Math.round(set.backingInRec * 100)}%`);
  root.appendChild(h('div', { class: 'card stack' },
    h('div', { class: 'tiny' }, 'Weekly goal'), goalChips,
    h('div', { class: 'hr' }),
    h('div', { class: 'tiny' }, 'Audio input'), inputSel,
    h('button', { class: 'btn sm', onclick: async () => { try { await AudioEngine.openInput(); AudioEngine.closeInput(); await fillInputs(); UI.toast('Inputs refreshed'); } catch (e) { UI.toast('Microphone access refused'); } } }, 'Detect inputs (asks for mic access)'),
    h('div', { class: 'row between' }, h('span', null, 'Input level'), gainLbl),
    h('input', { type: 'range', class: 'slider', min: 0.2, max: 3, step: 0.05, value: set.inputGain, oninput: e => { set.inputGain = +e.target.value; gainLbl.textContent = Math.round(set.inputGain * 100) + '%'; Store.save(); } }),
    h('div', { class: 'row between' }, h('div', null, h('div', null, 'Backing track in recordings'), h('div', { class: 'small muted' }, 'Mix the backing into your takes')), toggleEl(set.includeBacking, v => { set.includeBacking = v; Store.save(); })),
    h('div', { class: 'row between' }, h('span', null, 'Backing level in recordings'), recLbl),
    h('input', { type: 'range', class: 'slider', min: 0.1, max: 1, step: 0.05, value: set.backingInRec, oninput: e => { set.backingInRec = +e.target.value; recLbl.textContent = Math.round(set.backingInRec * 100) + '%'; Store.save(); } }),
    h('div', { class: 'row between' }, h('div', null, h('div', null, 'Tap sounds'), h('div', { class: 'small muted' }, 'Soft bubble pop when you tap buttons')), toggleEl(set.uiSounds !== false, v => { set.uiSounds = v; Store.save(); })),
    h('div', { class: 'row between' }, h('div', null, h('div', null, 'Hear my guitar through the app'), h('div', { class: 'small muted' }, 'Off with the Pulze (it already plays your guitar). Adds delay.')), toggleEl(set.monitor, v => { set.monitor = v; Store.save(); })),
  ));

  root.appendChild(h('div', { class: 'card stack help' },
    h('div', { class: 'tiny' }, 'Recording with the Pulze Mini'),
    h('p', { class: 'small' }, '1. Connect the Pulze Mini to the iPhone with a USB cable (USB-C iPhone: direct; Lightning iPhone: Apple “Lightning to USB 3 Camera Adapter”, powered).'),
    h('p', { class: 'small' }, '2. The iPhone uses it automatically as its microphone and speaker. Plug headphones into the Pulze.'),
    h('p', { class: 'small' }, '3. Allow microphone access the first time you hit record. If you don’t have the Pulze with you, the iPhone mic works too.'),
    h('p', { class: 'small muted' }, 'Your recordings and progress are stored on this device only. Use “Share” on a take to keep a copy in Files or send it.')));

  root.appendChild(h('div', { class: 'card stack' },
    h('button', { class: 'btn block', onclick: async () => {
      const txt = JSON.stringify({ ...st, exported: new Date().toISOString() });
      try { await navigator.clipboard.writeText(txt); UI.toast('Progress copied to clipboard'); } catch (e) { UI.toast('Copy failed'); }
    } }, 'Copy progress backup'),
    h('button', { class: 'btn block', onclick: async () => {
      const txt = await UI.prompt('Paste a progress backup', '', '{…}');
      if (!txt) return;
      try { const d = JSON.parse(txt); delete d.exported; Store.state = { ...defaultState(), ...d }; Store.save(); UI.toast('Progress restored'); App.go('progress'); } catch (e) { UI.toast('That doesn’t look like a backup'); }
    } }, 'Restore progress backup'),
    h('button', { class: 'btn danger block', onclick: async () => { if (await UI.confirm('Reset all progress?', 'XP, lessons and stats will be erased. Recordings stay in the Journal.', 'Reset', true)) { Store.reset(); App.go('home'); } } }, 'Reset progress'),
    h('p', { class: 'tiny center' }, 'Woodshed v1.6')));
  return root;
}
