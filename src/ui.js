// ---------- UI helpers ----------
function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const svgNS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(svgNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  kids.flat().forEach(c => c && el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))));
  return el;
}

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  learn: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
  ear: '<path d="M6 8.5a6 6 0 1 1 12 0c0 3-2 4-3 5.5s-1 2.5-1.5 3.8A3 3 0 0 1 8 17"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5"/>',
  studio: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>',
  journal: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  index: '<rect x="3" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5"/><circle cx="17.25" cy="17.25" r="3.9"/>',
  replay: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
};
function icon(name, size = 22, fill = false) {
  const el = document.createElementNS(svgNS, 'svg');
  el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('width', size); el.setAttribute('height', size);
  el.setAttribute('fill', fill ? 'currentColor' : 'none'); el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', '2'); el.setAttribute('stroke-linecap', 'round'); el.setAttribute('stroke-linejoin', 'round');
  el.innerHTML = ICONS[name];
  return el;
}

// ---------- Fretboard ----------
// opts: { from, to, marks:[{s,f,label,root,cls}], onTap(s,f,el), height }
function Fretboard(opts) {
  const from = Math.max(0, opts.from ?? 0), to = opts.to ?? 12;
  const showOpen = from === 0;
  const fw = opts.fretWidth || 48, openW = 34, padL = 22, padR = 10, padT = 10, sh = 30;
  const nFrets = to - Math.max(from, 1) + 1;
  const width = padL + (showOpen ? openW : 0) + nFrets * fw + padR;
  const height = padT + sh * 5 + 34;
  const svg = s('svg', { class: 'fb', width, height, viewBox: `0 0 ${width} ${height}` });
  const x0 = padL + (showOpen ? openW : 0);
  const firstFret = Math.max(from, 1);
  const fretX = f => f === 0 ? padL + openW / 2 : x0 + (f - firstFret + 0.5) * fw;
  const yOf = st => padT + (5 - st) * sh; // high e on top
  // board
  svg.appendChild(s('rect', { x: x0, y: padT - 6, width: nFrets * fw, height: sh * 5 + 12, rx: 6, fill: '#2a1f17' }));
  // inlays
  [3, 5, 7, 9, 15, 17].forEach(f => { if (f >= firstFret && f <= to) svg.appendChild(s('circle', { cx: fretX(f), cy: padT + sh * 2.5, r: 6, fill: '#4a3a2c' })); });
  if (12 >= firstFret && 12 <= to) { svg.appendChild(s('circle', { cx: fretX(12), cy: padT + sh * 1.5, r: 6, fill: '#4a3a2c' })); svg.appendChild(s('circle', { cx: fretX(12), cy: padT + sh * 3.5, r: 6, fill: '#4a3a2c' })); }
  // frets
  for (let i = 0; i <= nFrets; i++) {
    const x = x0 + i * fw;
    const isNut = i === 0 && firstFret === 1;
    svg.appendChild(s('line', { x1: x, y1: padT - 6, x2: x, y2: padT + sh * 5 + 6, stroke: isNut ? '#e8dcc8' : '#8a7a66', 'stroke-width': isNut ? 5 : 2 }));
  }
  // strings
  for (let st = 0; st < 6; st++) {
    const y = yOf(st);
    svg.appendChild(s('line', { x1: showOpen ? padL + 4 : x0, y1: y, x2: x0 + nFrets * fw, y2: y, stroke: '#cfc3b1', 'stroke-width': 1 + (5 - st) * 0.35, opacity: 0.85 }));
    svg.appendChild(s('text', { x: 8, y: y + 4, 'font-size': 11, fill: '#a89a8b', 'text-anchor': 'middle' }, STRINGS[st].label));
  }
  // fret numbers
  for (let f = firstFret; f <= to; f++) svg.appendChild(s('text', { x: fretX(f), y: padT + sh * 5 + 26, 'font-size': 11, fill: [3,5,7,9,12,15].includes(f) ? '#f2a541' : '#7a6d60', 'text-anchor': 'middle', 'font-weight': 700 }, f));
  if (showOpen) svg.appendChild(s('text', { x: fretX(0), y: padT + sh * 5 + 26, 'font-size': 11, fill: '#7a6d60', 'text-anchor': 'middle' }, '0'));
  // tap cells
  const marksLayer = s('g');
  if (opts.onTap) {
    const fs = []; if (showOpen) fs.push(0); for (let f = firstFret; f <= to; f++) fs.push(f);
    for (let st = 0; st < 6; st++) for (const f of fs) {
      const cx = fretX(f), w = f === 0 ? openW : fw;
      const r = s('rect', { class: 'cell', x: cx - w / 2, y: yOf(st) - sh / 2, width: w, height: sh });
      r.addEventListener('pointerdown', e => {
        e.preventDefault();
        const rp = s('circle', { class: 'ripple', cx, cy: yOf(st), r: 17, fill: 'none', stroke: '#ffcf7a', 'stroke-width': 3 });
        svg.appendChild(rp); setTimeout(() => rp.remove(), 480);
        opts.onTap(st, f);
      });
      svg.appendChild(r);
    }
  }
  svg.appendChild(marksLayer);
  function drawMark(m) {
    const cls = m.cls || (m.root ? 'root' : '');
    const colors = { root: ['#f2a541', '#241505'], good: ['#4fc18f', '#062517'], bad: ['#ef5d5d', '#fff'], shown: ['#6cb4ee', '#06213a'], '': ['#f4ede4', '#1b1714'], ghost: ['#3a322b', '#f4ede4'] };
    const [fill, tc] = colors[cls] || colors[''];
    const g = s('g', { class: 'mark' });
    g.appendChild(s('circle', { cx: fretX(m.f), cy: yOf(m.s), r: 12.5, fill, stroke: '#120f0d' }));
    if (m.label !== undefined && m.label !== '') g.appendChild(s('text', { x: fretX(m.f), y: yOf(m.s) + 4, 'font-size': String(m.label).length > 2 ? 9 : 11, 'font-weight': 800, fill: tc, 'text-anchor': 'middle' }, m.label));
    marksLayer.appendChild(g);
    return g;
  }
  (opts.marks || []).forEach(drawMark);
  const wrap = h('div', { class: 'fbwrap' }, svg);
  wrap.addMark = drawMark;
  wrap.clearMarks = () => { marksLayer.innerHTML = ''; };
  wrap.scrollToFret = f => { requestAnimationFrame(() => { wrap.scrollLeft = Math.max(0, fretX(f) - wrap.clientWidth / 2); }); };
  return wrap;
}

// ---------- toast, modal, celebrate ----------
const UI = {
  toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div', { class: 'toast' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('show'), 2200);
  },
  modal(content, { centered = false, onClose } = {}) {
    const m = h('div', { class: 'modal' + (centered ? ' centered' : '') }, content);
    const bg = h('div', { class: 'modal-bg', onclick: e => { if (e.target === bg) close(); } }, m);
    function close() { bg.remove(); onClose && onClose(); }
    document.body.appendChild(bg);
    return { close, el: m };
  },
  confirm(title, text, okLabel = 'OK', danger = false) {
    return new Promise(res => {
      const md = UI.modal(h('div', { class: 'stack' },
        h('h2', null, title), text && h('p', { class: 'muted' }, text),
        h('div', { class: 'row' },
          h('button', { class: 'btn grow', onclick: () => { md.close(); res(false); } }, 'Cancel'),
          h('button', { class: 'btn grow ' + (danger ? 'danger' : 'primary'), onclick: () => { md.close(); res(true); } }, okLabel))), { centered: true, onClose: () => res(false) });
    });
  },
  prompt(title, value = '', placeholder = '') {
    return new Promise(res => {
      const inp = h('input', { value, placeholder });
      const md = UI.modal(h('form', { class: 'stack', onsubmit: e => { e.preventDefault(); md.close(); res(inp.value.trim()); } },
        h('h2', null, title), inp,
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn grow', onclick: () => { md.close(); res(null); } }, 'Cancel'),
          h('button', { type: 'submit', class: 'btn grow primary' }, 'Save'))), { centered: true });
      setTimeout(() => inp.focus(), 50);
    });
  },
  celebrate(title, sub, emoji = '🎉') {
    const md = UI.modal(h('div', { class: 'celebrate stack' },
      h('div', { class: 'big' }, emoji), h('h1', null, title), sub && h('p', { class: 'muted' }, sub),
      h('button', { class: 'btn primary block', onclick: () => md.close() }, 'Nice!')), { centered: true });
  },
};

function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }
function fmtDate(ts) { return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
function toggleEl(on, onchange) {
  const t = h('button', { class: 'toggle' + (on ? ' on' : ''), role: 'switch' });
  t.addEventListener('click', () => { on = !on; t.classList.toggle('on', on); onchange(on); });
  return t;
}

// ---------- Chord box diagram ----------
function ChordDiagram(rootPc, type, opts = {}) {
  const { frets, fingers, barre } = opts.shape || chordShape(rootPc, type);
  const played = frets.filter(f => f > 0);
  const minF = played.length ? Math.min(...played) : 1;
  const maxF = played.length ? Math.max(...played) : 1;
  const start = maxF <= 4 ? 1 : minF;
  const nF = Math.max(4, maxF - start + 1);
  const sw = opts.small ? 18 : 24, fh = opts.small ? 22 : 30, padX = 34, padT = 34;
  const W = padX * 2 + sw * 5, H = padT + fh * nF + 30;
  const svg = s('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  const x = i => padX + i * sw, y = f => padT + (f - start + 0.5) * fh;
  svg.appendChild(s('rect', { x: x(0), y: padT, width: sw * 5, height: fh * nF, rx: 4, fill: '#2a1f17' }));
  for (let k = 0; k <= nF; k++) svg.appendChild(s('line', { x1: x(0), x2: x(5), y1: padT + k * fh, y2: padT + k * fh, stroke: k === 0 && start === 1 ? '#e8dcc8' : '#8a7a66', 'stroke-width': k === 0 && start === 1 ? 5 : 1.5 }));
  for (let i = 0; i < 6; i++) svg.appendChild(s('line', { x1: x(i), x2: x(i), y1: padT, y2: padT + fh * nF, stroke: '#cfc3b1', 'stroke-width': 1 + (5 - i) * 0.25 }));
  for (let f = start; f < start + nF; f++) svg.appendChild(s('text', { x: x(0) - 22, y: y(f) + 4, 'font-size': 10, fill: f === start && start > 1 ? '#f2a541' : '#7a6d60', 'text-anchor': 'middle', 'font-weight': 700 }, f));
  ['E','A','D','G','B','e'].forEach((l, i) => svg.appendChild(s('text', { x: x(i), y: padT + fh * nF + 18, 'font-size': 10, fill: '#a89a8b', 'text-anchor': 'middle', 'font-weight': 700 }, l)));
  if (barre && barre >= start) {
    const idx = frets.map((f, i) => f === barre ? i : -1).filter(i => i >= 0);
    if (idx.length > 1) svg.appendChild(s('rect', { x: x(idx[0]) - 9, y: y(barre) - 9, width: x(idx[idx.length - 1]) - x(idx[0]) + 18, height: 18, rx: 9, fill: '#f2a541' }));
  }
  frets.forEach((f, i) => {
    if (f === -1) svg.appendChild(s('text', { x: x(i), y: padT - 10, 'font-size': 13, fill: '#ef5d5d', 'text-anchor': 'middle', 'font-weight': 800 }, '×'));
    else if (f === 0) svg.appendChild(s('circle', { cx: x(i), cy: padT - 14, r: 5, fill: 'none', stroke: '#4fc18f', 'stroke-width': 2 }));
    else {
      const isRoot = fretPc(i, f) === mod12(rootPc);
      svg.appendChild(s('circle', { cx: x(i), cy: y(f), r: opts.small ? 8 : 10, fill: isRoot ? '#f2a541' : '#f4ede4', stroke: '#120f0d' }));
      if (fingers[i]) svg.appendChild(s('text', { x: x(i), y: y(f) + 4, 'font-size': opts.small ? 10 : 12, 'font-weight': 800, fill: '#241505', 'text-anchor': 'middle' }, fingers[i]));
    }
  });
  const wrap = h('div', { class: 'chordbox', onclick: () => {
    AudioEngine.strum(frets.map((f, i) => f >= 0 ? fretMidi(i, f) : null).filter(x => x !== null), AudioEngine.now() + 0.02, { gain: 0.32, spread: 0.035 });
  } }, h('b', null, opts.label || chordName(rootPc, type)), svg, opts.caption ? h('small', { class: 'muted', style: { fontSize: '11px' } }, opts.caption) : null);
  return wrap;
}
