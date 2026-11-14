// ---------- Persistent state (localStorage) + recordings (IndexedDB) ----------
const STATE_KEY = 'woodshed.state.v1';

function defaultState() {
  return {
    xp: 0,
    sessions: [],            // {date: ISO, minutes, lessonId, counted}
    lessonsDone: {},         // lessonId -> date
    srs: {},                 // questionId -> {box, due}
    drills: {},              // lessonId -> best clean bpm
    ear: { unlocked: 1, history: {}, typed: {}, dailyDate: null, dailyScore: null },
    surpriseDone: null,      // date string
    weekBonus: {},           // weekKey -> true
    xpLog: [],
    settings: { inputId: '', includeBacking: true, backingInRec: 0.55, weeklyGoal: 2, monitor: false, inputGain: 1, uiSounds: true },
    created: new Date().toISOString(),
  };
}

const Store = {
  state: null,
  load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); } catch (e) {}
    const d = defaultState();
    this.state = s ? { ...d, ...s, ear: { ...d.ear, ...(s.ear || {}) }, settings: { ...d.settings, ...(s.settings || {}) } } : d;
    return this.state;
  },
  save() { try { localStorage.setItem(STATE_KEY, JSON.stringify(this.state)); } catch (e) {} },
  reset() { this.state = defaultState(); this.save(); },
};

// ---- dates & weeks ----
function todayStr(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function weekKey(d = new Date()) {
  // ISO week, Monday start
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`;
}
function sessionsThisWeek() {
  const wk = weekKey();
  return Store.state.sessions.filter(s => s.counted && weekKey(new Date(s.date)) === wk).length;
}
function weekStreak() {
  // consecutive successful weeks, ending with this week (if already met) or last week
  const goal = Store.state.settings.weeklyGoal;
  const counts = {};
  Store.state.sessions.forEach(s => { if (s.counted) { const k = weekKey(new Date(s.date)); counts[k] = (counts[k] || 0) + 1; } });
  let streak = 0;
  const d = new Date();
  if ((counts[weekKey(d)] || 0) >= goal) streak++;
  d.setDate(d.getDate() - 7);
  for (let i = 0; i < 520; i++) {
    if ((counts[weekKey(d)] || 0) >= goal) { streak++; d.setDate(d.getDate() - 7); }
    else break;
  }
  return streak;
}
function daysSinceLastSession() {
  const c = Store.state.sessions.filter(s => s.counted);
  if (!c.length) return null;
  const last = new Date(c[c.length - 1].date);
  const a = new Date(todayStr()), b = new Date(todayStr(last));
  return Math.round((a - b) / 86400000);
}

// ---- XP & levels ----
const XP_PER_LEVEL = 150;
function levelInfo(xp = Store.state.xp) {
  const lvl = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { lvl, title: LEVEL_TITLES[Math.min(lvl - 1, LEVEL_TITLES.length - 1)], into: xp % XP_PER_LEVEL, need: XP_PER_LEVEL };
}
function addXP(n, why) {
  const before = levelInfo();
  Store.state.xp += n;
  Store.state.xpLog.push({ d: new Date().toISOString(), n, why });
  if (Store.state.xpLog.length > 200) Store.state.xpLog = Store.state.xpLog.slice(-200);
  Store.save();
  const after = levelInfo();
  const unlockedNow = Object.entries(AudioEngine.STYLES).filter(([k, s]) => s.xp > Store.state.xp - n && s.xp <= Store.state.xp).map(([k, s]) => s.name);
  UI.toast(`+${n} XP · ${why}`);
  if (after.lvl > before.lvl) setTimeout(() => UI.celebrate(`Level ${after.lvl}!`, after.title), 600);
  if (unlockedNow.length) setTimeout(() => UI.celebrate('Unlocked!', `New backing track: ${unlockedNow.join(', ')}`), 1400);
}
function styleUnlocked(k) { return Store.state.xp >= AudioEngine.STYLES[k].xp; }

// ---- spaced repetition (Leitner boxes) ----
const SRS_DAYS = [0, 1, 3, 7, 16, 35];
function srsAnswer(qid, correct) {
  const it = Store.state.srs[qid] || { box: 0, due: todayStr() };
  it.box = correct ? Math.min(it.box + 1, SRS_DAYS.length - 1) : 1;
  const d = new Date(); d.setDate(d.getDate() + SRS_DAYS[it.box]);
  it.due = todayStr(d);
  Store.state.srs[qid] = it;
  Store.save();
}
function srsDue() {
  const t = todayStr();
  return Object.entries(Store.state.srs).filter(([id, it]) => it.due <= t && QUESTION_BY_ID[id]).map(([id]) => id);
}

// ---- ear stats ----
function earRecord(level, correct) {
  const h = Store.state.ear.history[level] || [];
  h.push(correct ? 1 : 0);
  Store.state.ear.history[level] = h.slice(-30);
  const recent = Store.state.ear.history[level].slice(-20);
  if (recent.length >= 20 && recent.reduce((a, b) => a + b, 0) >= 16) {
    if (Store.state.ear.unlocked === level && level < EAR_LEVELS.length) {
      Store.state.ear.unlocked = level + 1;
      setTimeout(() => UI.celebrate('Ear level unlocked!', EAR_LEVELS[level].name), 500);
    }
    if (!Store.state.ear.typedAvail) Store.state.ear.typedAvail = {};
    if (!Store.state.ear.typedAvail[level]) {
      Store.state.ear.typedAvail[level] = true;
      setTimeout(() => UI.toast('Typed answers unlocked for this level'), 1200);
    }
  }
  Store.save();
}
function earAccuracy(level) {
  const h = (Store.state.ear.history[level] || []).slice(-20);
  return h.length ? Math.round(100 * h.reduce((a, b) => a + b, 0) / h.length) : null;
}

// ---- next lesson ----
function nextLesson() {
  return ALL_LESSONS.find(l => !Store.state.lessonsDone[l.id]) || null;
}
function chapterProgress(ch) {
  const done = ch.lessons.filter(l => Store.state.lessonsDone[l.id]).length;
  return { done, total: ch.lessons.length };
}
function chapterUnlocked(idx) {
  if (idx === 0) return true;
  if (CHAPTERS[idx].lessons.some(l => Store.state.lessonsDone[l.id])) return true;
  const prev = CHAPTERS[idx - 1];
  if (prev.soon) return false;
  const p = chapterProgress(prev);
  return p.done >= Math.ceil(p.total / 2); // half of previous chapter opens the next
}

// ---------- IndexedDB for recordings ----------
const RecDB = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('woodshed', 1);
      r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains('recs')) db.createObjectStore('recs', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('recs', mode);
      const st = t.objectStore('recs');
      const out = fn(st);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    async put(rec) { return tx('readwrite', st => st.put(rec)); },
    async del(id) { return tx('readwrite', st => st.delete(id)); },
    async all() {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('recs', 'readonly');
        const r = t.objectStore('recs').getAll();
        r.onsuccess = () => res((r.result || []).sort((a, b) => b.createdAt - a.createdAt));
        r.onerror = () => rej(r.error);
      });
    },
    async get(id) {
      const db = await open();
      return new Promise((res, rej) => {
        const r = db.transaction('recs', 'readonly').objectStore('recs').get(id);
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      });
    },
  };
})();

async function requestPersistence() {
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
}
