// ---------- Audio engine: guitar synth, drums, backing tracks, recorder ----------
const AudioEngine = (() => {
  let ctx = null, master, backingBus, sfxBus, uiBus, noiseBuf;
  const ksCache = new Map();

  function setSession(type) {
    try { if (navigator.audioSession) navigator.audioSession.type = type; } catch (e) {}
  }

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(comp); comp.connect(ctx.destination);
      backingBus = ctx.createGain(); backingBus.gain.value = 0.8; backingBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
      // small room reverb: makes the guitar synth and UI sounds less dry
      try {
        const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
        const verb = ctx.createConvolver(); verb.buffer = ir;
        const wet = ctx.createGain(); wet.gain.value = 0.22;
        verb.connect(wet); wet.connect(master);
        const sfxSend = ctx.createGain(); sfxSend.gain.value = 0.55; sfxBus.connect(sfxSend); sfxSend.connect(verb);
        const bSend = ctx.createGain(); bSend.gain.value = 0.25; backingBus.connect(bSend); bSend.connect(verb);
        uiBus = ctx.createGain(); uiBus.gain.value = 1; uiBus.connect(master);
        const uiSend = ctx.createGain(); uiSend.gain.value = 0.35; uiBus.connect(uiSend); uiSend.connect(verb);
      } catch (e) { uiBus = sfxBus; }
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (!recorder.stream) setSession('playback');
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  }

  // Karplus-Strong plucked string with fractional delay (accurate tuning)
  function ksBuffer(midi, dur = 2.4, bright = 0.6) {
    const key = midi + '|' + dur + '|' + bright;
    if (ksCache.has(key)) return ksCache.get(key);
    const sr = ctx.sampleRate, f = midiToFreq(midi);
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const N = sr / f - 0.5;           // the 2-tap average adds ~0.5 sample of delay
    const Ni = Math.floor(N), p = N - Ni;
    const loss = Math.pow(0.001, 1 / (f * dur * 0.9));
    let lp = 0;
    for (let i = 0; i < Math.min(Ni + 2, len); i++) {
      const w = Math.random() * 2 - 1;
      lp += bright * (w - lp);
      d[i] = lp;
    }
    // y[n] = loss * 0.5 * (x[n-D'] + x[n-D'-1]) with linear interpolation of the fractional delay
    for (let i = Ni + 2; i < len; i++) {
      d[i] = loss * 0.5 * ((1 - p) * d[i - Ni] + d[i - Ni - 1] + p * d[i - Ni - 2]);
    }
    // remove DC + fade tail
    let mean = 0; for (let i = 0; i < len; i++) mean += d[i]; mean /= len;
    const fade = Math.floor(sr * 0.06);
    for (let i = 0; i < len; i++) {
      d[i] -= mean;
      if (i > len - fade) d[i] *= (len - i) / fade;
    }
    // normalise
    let peak = 0; for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(d[i]));
    if (peak > 0) for (let i = 0; i < len; i++) d[i] /= peak;
    ksCache.set(key, buf);
    return buf;
  }

  function pluck(midi, when, opts = {}) {
    ensure();
    const { dur = 2.4, gain = 0.4, bright = 0.6, dest = sfxBus, cut = null, tone = 4200 } = opts;
    const src = ctx.createBufferSource();
    src.buffer = ksBuffer(midi, dur, bright);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = tone;
    g.gain.setValueAtTime(gain, when);
    if (cut) { g.gain.setValueAtTime(gain, when + cut); g.gain.exponentialRampToValueAtTime(0.0001, when + cut + 0.08); }
    src.connect(lp); lp.connect(g); g.connect(dest);
    src.start(when);
    src.stop(when + (cut ? cut + 0.1 : dur));
    return src;
  }

  function strum(midis, when, opts = {}) {
    const spread = opts.spread ?? 0.018;
    const n = midis.length;
    midis.forEach((m, i) => pluck(m, when + i * spread, { ...opts, gain: (opts.gain ?? 0.25) * (1 - i * 0.04) / Math.sqrt(n / 3) }));
  }

  function now() { ensure(); return ctx.currentTime; }
  // ---------- UI sounds ----------
  function tone(f, t, { type = 'sine', dur = 0.12, vol = 0.06, to = null, attack = 0.006 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(uiBus); o.start(t); o.stop(t + dur + 0.02);
  }
  // soft water-drop "bubble": slightly different every time so it never feels robotic
  function pop(bright = false) {
    try {
      ensure();
      const t = ctx.currentTime + 0.004, v = 0.92 + Math.random() * 0.16;
      const f0 = (bright ? 440 : 330) * v;
      tone(f0, t, { dur: 0.09, vol: bright ? 0.07 : 0.05, to: f0 * 2.6 });
      tone(f0 * 3.01, t + 0.012, { dur: 0.05, vol: 0.012, to: f0 * 4 });
    } catch (e) {}
  }
  function tick() { try { ensure(); const t = ctx.currentTime + 0.003; tone(1800 + Math.random() * 200, t, { type: 'triangle', dur: 0.03, vol: 0.025 }); } catch (e) {} }
  // correct: two bell-like plucks (a rising major third)
  function chime() {
    try {
      ensure(); const t = ctx.currentTime + 0.01;
      pluck(79, t, { gain: 0.16, bright: 0.85, dur: 1.4, dest: uiBus, tone: 7000 });
      pluck(83, t + 0.09, { gain: 0.18, bright: 0.85, dur: 1.6, dest: uiBus, tone: 7000 });
      tone(1568, t + 0.09, { dur: 0.5, vol: 0.02 });
    } catch (e) {}
  }
  // wrong: soft, low "boop" (no harsh buzzer)
  function nope() {
    try { ensure(); const t = ctx.currentTime + 0.01; tone(260, t, { dur: 0.18, vol: 0.07, to: 180 }); tone(195, t + 0.1, { dur: 0.22, vol: 0.05, to: 150 }); } catch (e) {}
  }
  // XP / reward: quick sparkling arpeggio
  function sparkle(big = false) {
    try {
      ensure(); const t = ctx.currentTime + 0.01;
      const notes = big ? [72, 76, 79, 84, 88, 91] : [79, 84, 88];
      notes.forEach((m, i) => pluck(m, t + i * (big ? 0.075 : 0.06), { gain: big ? 0.16 : 0.1, bright: 0.9, dur: 1.4, dest: uiBus, tone: 8000 }));
      if (big) tone(2093, t + notes.length * 0.075, { dur: 0.9, vol: 0.02 });
    } catch (e) {}
  }

  // ---- drums ----
  function kick(when, vol = 1, dest = backingBus) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.13);
    g.gain.setValueAtTime(0.9 * vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.38);
    o.connect(g); g.connect(dest); o.start(when); o.stop(when + 0.4);
  }
  function snare(when, vol = 1, dest = backingBus) {
    const n = ctx.createBufferSource(); n.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.55 * vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
    n.connect(bp); bp.connect(g); g.connect(dest); n.start(when); n.stop(when + 0.22);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = 190;
    og.gain.setValueAtTime(0.35 * vol, when); og.gain.exponentialRampToValueAtTime(0.001, when + 0.09);
    o.connect(og); og.connect(dest); o.start(when); o.stop(when + 0.1);
  }
  function hat(when, vol = 1, open = false, dest = backingBus) {
    const n = ctx.createBufferSource(); n.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
    const g = ctx.createGain();
    const len = open ? 0.25 : 0.045;
    g.gain.setValueAtTime(0.22 * vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + len);
    n.connect(hp); hp.connect(g); g.connect(dest); n.start(when, Math.random() * 0.5); n.stop(when + len + 0.02);
  }
  function click(when, accent = false) {
    ensure();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = accent ? 2000 : 1400;
    g.gain.setValueAtTime(accent ? 0.25 : 0.15, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.03);
    o.connect(g); g.connect(backingBus); o.start(when); o.stop(when + 0.04);
  }
  function bass(midi, when, len, vol = 1) {
    pluck(midi, when, { dur: 1.6, gain: 0.55 * vol, bright: 0.35, dest: backingBus, cut: len, tone: 900 });
  }

  // ---- backing track styles ----
  // prog: list of [semitoneOffsetFromKeyRoot, chordType] — one bar each
  const STYLES = {
    rock:   { name: 'Rock',          tonality: 'minor', feel: 'straight', bpm: 100, xp: 0,
              prog: [[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']], scales: ['minorPent','minor'], tone: 'Crunch / light overdrive' },
    blues:  { name: 'Blues shuffle', tonality: 'blues', feel: 'shuffle',  bpm: 84,  xp: 0,
              prog: [[0,'dom7'],[0,'dom7'],[0,'dom7'],[0,'dom7'],[5,'dom7'],[5,'dom7'],[0,'dom7'],[0,'dom7'],[7,'dom7'],[5,'dom7'],[0,'dom7'],[7,'dom7']],
              scales: ['blues','minorPent','majorPent'], tone: 'Edge-of-breakup + spring reverb' },
    metronome: { name: 'Metronome only', tonality: 'none', feel: 'straight', bpm: 80, xp: 0, prog: [[0,'maj']], scales: ['major','minorPent'], tone: 'Any' },
    pop:    { name: 'Pop',           tonality: 'major', feel: 'straight', bpm: 110, xp: 120,
              prog: [[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']], scales: ['majorPent','major'], tone: 'Clean + chorus' },
    funk:   { name: 'Funk vamp',     tonality: 'minor', feel: 'straight', bpm: 96,  xp: 250,
              prog: [[0,'m7'],[0,'m7'],[5,'dom7'],[5,'dom7']], scales: ['dorian','minorPent'], tone: 'Clean, bright, a bit of compression' },
    ballad: { name: 'Slow ballad',   tonality: 'major', feel: 'straight', bpm: 68,  xp: 400,
              prog: [[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']], scales: ['majorPent','major'], tone: 'Clean + delay + big reverb' },
    soul:   { name: 'Soul groove',   tonality: 'major', feel: 'straight', bpm: 88,  xp: 600,
              prog: [[0,'maj7'],[0,'maj7'],[5,'maj7'],[5,'maj7']], scales: ['major','majorPent'], tone: 'Warm clean, neck pickup' },
  };

  function bassMidi(pc) { let m = 28 + mod12(pc - 4); if (m > 38) m -= 12; return m; } // E1..D2

  function playStep(style, s, bar, t, sd, chordRoot, chordType, nextRoot) {
    const vox = chordVoicing(chordRoot, chordType);
    const b = bassMidi(chordRoot);
    const iv = CHORD_TYPES[chordType].iv;
    switch (style) {
      case 'metronome':
        if (s % 4 === 0) click(t, s === 0);
        break;
      case 'rock':
        if (s === 0 || s === 8 || s === 10) kick(t);
        if (s === 4 || s === 12) snare(t);
        if (s % 2 === 0) hat(t, s % 4 === 0 ? 0.9 : 0.6);
        if (s % 2 === 0) bass(b, t, sd * 1.8, 0.9);
        if (s === 0) strum(vox, t, { gain: 0.22, bright: 0.75, dest: backingBus, cut: sd * 7.5, tone: 3000 });
        if (s === 8) strum(vox, t, { gain: 0.18, bright: 0.75, dest: backingBus, cut: sd * 5.5, tone: 3000 });
        if (s === 14) strum(vox.slice(0, 3), t, { gain: 0.14, bright: 0.7, dest: backingBus, cut: sd * 1.5, tone: 3000 });
        break;
      case 'pop':
        if (s === 0 || s === 6 || s === 8) kick(t);
        if (s === 4 || s === 12) snare(t, 0.9);
        if (s % 2 === 0) hat(t, 0.7);
        if (s % 2 === 0) bass(b + (s === 6 || s === 14 ? 12 : 0), t, sd * 1.6, 0.85);
        if (s === 0 || s === 6 || s === 10) strum(vox, t, { gain: 0.16, bright: 0.8, dest: backingBus, cut: sd * 3.5, tone: 5000 });
        break;
      case 'funk':
        if (s === 0 || s === 7 || s === 10) kick(t);
        if (s === 4 || s === 12) snare(t);
        if (s === 14) snare(t, 0.25);
        hat(t, s % 2 === 0 ? 0.6 : 0.35);
        if ([0, 3, 6, 10, 11].includes(s)) bass(b + (s === 3 || s === 11 ? 12 : 0), t, sd * 0.9, 0.95);
        if ([2, 6, 9, 13].includes(s)) strum(vox.slice(1), t, { gain: 0.15, bright: 0.9, dest: backingBus, cut: sd * 0.7, spread: 0.008, tone: 6000 });
        break;
      case 'ballad': {
        if (s === 0 || s === 10) kick(t, 0.8);
        if (s === 8) snare(t, 0.6);
        if (s % 4 === 2) hat(t, 0.45);
        if (s === 0) bass(b, t, sd * 7.5, 0.8);
        if (s === 8) bass(b + iv[2], t, sd * 7.5, 0.7);
        if (s % 2 === 0) {
          const order = [0, 1, 2, 3, 4, 3, 2, 1];
          const m = vox[order[(s / 2) % order.length] % vox.length];
          pluck(m + 12, t, { gain: 0.16, bright: 0.55, dest: backingBus, dur: 2.0, tone: 3500 });
        }
        break;
      }
      case 'soul':
        if (s === 0 || s === 9) kick(t, 0.85);
        if (s === 4 || s === 12) snare(t, 0.55);
        hat(t, s % 2 === 0 ? 0.4 : 0.2);
        if (s === 0) bass(b, t, sd * 6, 0.85);
        if (s === 7) bass(b + iv[2], t, sd * 2.5, 0.75);
        if (s === 10) bass(b + 12, t, sd * 4, 0.75);
        if (s === 0 || s === 8) strum(vox, t, { gain: 0.13, bright: 0.4, dest: backingBus, cut: sd * 7, spread: 0.03, tone: 2200 });
        break;
      case 'blues': {
        // 12 steps per bar (triplet grid). Beats at 0,3,6,9; shuffle offbeat at +2
        if (s === 0 || s === 6) kick(t);
        if (s === 3 || s === 9) snare(t, 0.9);
        if (s % 3 === 0 || s % 3 === 2) hat(t, s % 3 === 0 ? 0.7 : 0.45);
        const walk = [0, 7, 9, 10];               // root, 5, 6, b7 boogie
        if (s % 3 === 0) bass(b + walk[s / 3], t, sd * 1.8, 0.9);
        if (s % 3 === 2) bass(b + walk[(s - 2) / 3], t, sd * 0.9, 0.6);
        if (s === 0) strum(vox, t, { gain: 0.17, bright: 0.7, dest: backingBus, cut: sd * 2.5, tone: 3200 });
        if (s === 5 || s === 11) strum(vox.slice(1, 4), t, { gain: 0.12, bright: 0.7, dest: backingBus, cut: sd * 0.8, tone: 3200 });
        break;
      }
    }
  }

  const backing = { playing: false, timer: null };

  function startBacking(cfg, cb = {}) {
    ensure();
    stopBacking();
    const st = STYLES[cfg.style];
    const stepsPerBar = st.feel === 'shuffle' ? 12 : 16;
    const sd = (60 / cfg.bpm) * 4 / stepsPerBar;
    const keyPc = pcOf(cfg.key);
    let step = 0, bar = 0;
    let next = ctx.currentTime + 0.12;
    backing.playing = true;
    backing.cfg = cfg;
    const tick = () => {
      while (next < ctx.currentTime + 0.18) {
        const p = st.prog[bar % st.prog.length];
        const np = st.prog[(bar + 1) % st.prog.length];
        const root = mod12(keyPc + p[0]);
        playStep(cfg.style, step, bar, next, sd, root, p[1], mod12(keyPc + np[0]));
        const delay = Math.max(0, (next - ctx.currentTime) * 1000);
        if (step === 0 && cb.onBar) { const b = bar; setTimeout(() => backing.playing && cb.onBar(b, root, p[1], np), delay); }
        if (cb.onBeat && step % (stepsPerBar / 4) === 0) { const beat = step / (stepsPerBar / 4); setTimeout(() => backing.playing && cb.onBeat(beat), delay); }
        next += sd;
        step++;
        if (step >= stepsPerBar) { step = 0; bar++; }
      }
    };
    tick();
    backing.timer = setInterval(tick, 25);
  }
  function stopBacking() {
    backing.playing = false;
    if (backing.timer) clearInterval(backing.timer);
    backing.timer = null;
  }
  function setBackingVolume(v) { ensure(); backingBus.gain.value = v; }

  // ---- recorder ----
  const recorder = { stream: null, src: null, inGain: null, analyser: null, mr: null, chunks: [], startedAt: 0, recDest: null, toRec: null, monitor: null };

  function pickMime() {
    if (!window.MediaRecorder) return '';
    const opts = ['audio/mp4', 'audio/mp4;codecs=mp4a.40.2', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (const m of opts) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {} }
    return '';
  }

  async function openInput(deviceId) {
    ensure();
    if (recorder.stream) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser cannot record audio here. Open the app from your home screen (HTTPS).');
    setSession('play-and-record');
    const audio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    if (deviceId) audio.deviceId = { exact: deviceId };
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio }); }
    catch (e) {
      if (deviceId) { delete audio.deviceId; stream = await navigator.mediaDevices.getUserMedia({ audio }); }
      else { setSession('playback'); throw e; }
    }
    recorder.stream = stream;
    recorder.src = ctx.createMediaStreamSource(stream);
    recorder.inGain = ctx.createGain();
    recorder.inGain.gain.value = 1;
    recorder.analyser = ctx.createAnalyser(); recorder.analyser.fftSize = 1024;
    recorder.src.connect(recorder.inGain); recorder.inGain.connect(recorder.analyser);
    if (ctx.state !== 'running') await ctx.resume();
    return true;
  }
  function setMonitor(on) {
    if (!recorder.inGain) return;
    if (on && !recorder.monitor) { recorder.monitor = ctx.createGain(); recorder.monitor.gain.value = 1; recorder.inGain.connect(recorder.monitor); recorder.monitor.connect(master); }
    if (!on && recorder.monitor) { try { recorder.inGain.disconnect(recorder.monitor); recorder.monitor.disconnect(); } catch (e) {} recorder.monitor = null; }
  }
  function setInputGain(v) { if (recorder.inGain) recorder.inGain.gain.value = v; }
  function level() {
    if (!recorder.analyser) return 0;
    const a = new Float32Array(recorder.analyser.fftSize);
    recorder.analyser.getFloatTimeDomainData(a);
    let pk = 0; for (const x of a) pk = Math.max(pk, Math.abs(x));
    return pk;
  }
  function closeInput() {
    if (recorder.mr && recorder.mr.state !== 'inactive') { try { recorder.mr.stop(); } catch (e) {} }
    setMonitor(false);
    if (recorder.stream) recorder.stream.getTracks().forEach(t => t.stop());
    try { recorder.src && recorder.src.disconnect(); } catch (e) {}
    recorder.stream = recorder.src = recorder.inGain = recorder.analyser = null;
    setSession('playback');
  }

  function startRecording({ includeBacking = true, backingLevel = 0.6 } = {}) {
    if (!recorder.stream) throw new Error('Input not open');
    const mime = pickMime();
    let streamToRecord = null;
    try {
      recorder.recDest = ctx.createMediaStreamDestination();
      recorder.inGain.connect(recorder.recDest);
      if (includeBacking) {
        recorder.toRec = ctx.createGain(); recorder.toRec.gain.value = backingLevel;
        backingBus.connect(recorder.toRec); recorder.toRec.connect(recorder.recDest);
      }
      streamToRecord = recorder.recDest.stream;
    } catch (e) { streamToRecord = recorder.stream; }
    let mr;
    try { mr = mime ? new MediaRecorder(streamToRecord, { mimeType: mime }) : new MediaRecorder(streamToRecord); }
    catch (e) { mr = new MediaRecorder(recorder.stream); }
    recorder.chunks = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) recorder.chunks.push(e.data); };
    mr.start(500);
    recorder.mr = mr;
    recorder.startedAt = performance.now();
  }
  function stopRecording() {
    return new Promise(resolve => {
      const mr = recorder.mr;
      if (!mr) return resolve(null);
      const duration = (performance.now() - recorder.startedAt) / 1000;
      mr.onstop = () => {
        const type = mr.mimeType || (recorder.chunks[0] && recorder.chunks[0].type) || 'audio/mp4';
        const blob = new Blob(recorder.chunks, { type });
        try { recorder.recDest && recorder.inGain && recorder.inGain.disconnect(recorder.recDest); } catch (e) {}
        try { if (recorder.toRec) { backingBus.disconnect(recorder.toRec); recorder.toRec.disconnect(); } } catch (e) {}
        recorder.toRec = null; recorder.recDest = null; recorder.mr = null;
        resolve({ blob, mime: type, duration });
      };
      try { mr.stop(); } catch (e) { resolve(null); }
    });
  }
  function isRecording() { return !!(recorder.mr && recorder.mr.state === 'recording'); }
  function elapsed() { return isRecording() ? (performance.now() - recorder.startedAt) / 1000 : 0; }

  async function listInputs() {
    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      return devs.filter(d => d.kind === 'audioinput');
    } catch (e) { return []; }
  }

  return {
    ensure, now, pop, tick, chime, nope, sparkle, pluck, strum, click, STYLES,
    startBacking, stopBacking, setBackingVolume, get backingPlaying() { return backing.playing; },
    openInput, closeInput, startRecording, stopRecording, isRecording, elapsed, level, setMonitor, setInputGain, listInputs,
    get inputOpen() { return !!recorder.stream; },
  };
})();
