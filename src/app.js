// ---------- App shell & router ----------
const App = {
  current: null, view: null,
  tabs: [['home', 'Home', 'home'], ['learn', 'Learn', 'learn'], ['index', 'Index', 'index'], ['ear', 'Ear', 'ear'], ['studio', 'Studio', 'studio'], ['journal', 'Journal', 'journal']],
  routes: {
    home: { view: HomeView, tab: 'home' },
    session: { view: SessionView, full: true },
    learn: { view: LearnView, tab: 'learn' },
    chapter: { view: ChapterView, tab: 'learn' },
    lesson: { view: LessonView, tab: 'learn' },
    review: { view: ReviewView, tab: 'learn' },
    index: { view: IndexView, tab: 'index' },
    note: { view: NoteView, tab: 'index' },
    ear: { view: EarView, tab: 'ear' },
    earRun: { view: EarRunView, tab: 'ear' },
    studio: { view: StudioScreen, tab: 'studio' },
    challenge: { view: ChallengeView, tab: 'home' },
    journal: { view: JournalView, tab: 'journal' },
    progress: { view: ProgressView, tab: 'home' },
  },
  go(name, params = {}) {
    if (this.view && this.view.cleanup) { try { this.view.cleanup(); } catch (e) {} }
    const r = this.routes[name] || this.routes.home;
    this.current = name;
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.classList.toggle('fullscreen', !!r.full);
    try { this.view = r.view(params); }
    catch (e) { console.error(e); this.view = h('div', { class: 'card' }, h('h3', null, 'Something went wrong'), h('p', { class: 'small muted' }, String(e && e.stack || e))); }
    this.view.classList.add('view-enter');
    app.appendChild(this.view);
    this.renderTabs(r);
    window.scrollTo(0, 0);
  },
  renderTabs(r) {
    let bar = document.querySelector('.tabs');
    if (r.full) { if (bar) bar.style.display = 'none'; return; }
    if (!bar) {
      bar = h('nav', { class: 'tabs' }, h('i', { class: 'tabpill', style: { width: (100 / this.tabs.length) + '%' } }));
      this.tabs.forEach(([k, label, ic]) => bar.appendChild(h('button', { 'data-tab': k, onclick: () => { if (this.current !== k) this.go(k); } }, icon(ic, 24), h('span', null, label))));
      document.body.appendChild(bar);
    }
    bar.style.display = '';
    const idx = this.tabs.findIndex(t => t[0] === r.tab);
    bar.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === idx));
    bar.querySelector('.tabpill').style.transform = `translateX(${idx * 100}%)`;
  },
};

// ---------- touch feel: bubble ripple + soft pop ----------
const PRESSABLE = '.notebubble, .keychip, .progrow, .friendrow, .btn, .chip, .tile, .option, .card.tap, .tabs button, .iconbtn, .levelchip, .seg button, .lessonrow, .recbtn, .chordbox, .rec .play';
document.addEventListener('pointerdown', e => {
  const el = e.target.closest(PRESSABLE);
  if (!el || el.disabled) return;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2.2;
  const rip = document.createElement('span');
  rip.className = 'rip';
  rip.style.width = rip.style.height = size + 'px';
  rip.style.left = (e.clientX - r.left - size / 2) + 'px';
  rip.style.top = (e.clientY - r.top - size / 2) + 'px';
  el.appendChild(rip);
  setTimeout(() => rip.remove(), 650);
  if (Store.state && Store.state.settings.uiSounds !== false) AudioEngine.pop(el.classList.contains('primary') || el.classList.contains('on'));
}, { passive: true });

window.addEventListener('DOMContentLoaded', () => {
  Store.load();
  requestPersistence();
  App.go('home');
  try { navigator.clearAppBadge && navigator.clearAppBadge(); } catch (e) {}
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
});
