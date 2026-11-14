// ---------- App shell & router ----------
const App = {
  current: null, view: null,
  tabs: [['home', 'Home', 'home'], ['learn', 'Learn', 'learn'], ['ear', 'Ear', 'ear'], ['studio', 'Studio', 'studio'], ['journal', 'Journal', 'journal']],
  routes: {
    home: { view: HomeView, tab: 'home' },
    session: { view: SessionView, full: true },
    learn: { view: LearnView, tab: 'learn' },
    chapter: { view: ChapterView, tab: 'learn' },
    lesson: { view: LessonView, tab: 'learn' },
    review: { view: ReviewView, tab: 'learn' },
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
    app.appendChild(this.view);
    this.renderTabs(r);
    window.scrollTo(0, 0);
  },
  renderTabs(r) {
    let bar = document.querySelector('.tabs');
    if (r.full) { if (bar) bar.style.display = 'none'; return; }
    if (!bar) { bar = h('nav', { class: 'tabs' }); document.body.appendChild(bar); }
    bar.style.display = '';
    bar.innerHTML = '';
    this.tabs.forEach(([k, label, ic]) => bar.appendChild(h('button', { class: r.tab === k ? 'on' : '', onclick: () => this.go(k) }, icon(ic, 24), label)));
  },
};

window.addEventListener('DOMContentLoaded', () => {
  Store.load();
  requestPersistence();
  App.go('home');
  try { navigator.clearAppBadge && navigator.clearAppBadge(); } catch (e) {}
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
});
