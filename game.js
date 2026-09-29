(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const numbers = [...document.querySelectorAll('.number')];
  const GLITCH_MS = 140;
  const REVEAL_BUTTON_MS = 900;
  let next = 1, phase = 'loading';
  let audio = null, cue = null, activeSource = null, master = null;
  let ready = false, timers = [], generation = 0;
  const later = (fn, delay) => {
    const token = generation;
    timers.push(setTimeout(() => { if (token === generation) fn(); }, delay));
  };
  const cancelTimers = () => { generation++; timers.forEach(clearTimeout); timers = []; };
  function stopAudio() {
    if (activeSource) {
      try { activeSource.stop(); activeSource.disconnect(); } catch (_) {}
      activeSource = null;
    }
  }
  function unlockAudio() {
    // Resume directly from a tap, before any timer or promise, for iPhone playback.
    if (!audio) return;
    if (audio.state !== 'running') audio.resume().catch(() => {});
    try {
      const silent = audio.createBufferSource();
      silent.buffer = audio.createBuffer(1, 1, audio.sampleRate);
      silent.connect(audio.destination); silent.start(0);
      silent.onended = () => silent.disconnect();
    } catch (_) {}
  }
  function playCue() {
    if (!audio || !cue || document.hidden) return;
    stopAudio();
    try {
      const source = audio.createBufferSource();
      source.buffer = cue; source.loop = true; source.loopStart = 0; source.loopEnd = cue.duration;
      source.connect(master); activeSource = source;
      source.onended = () => { source.disconnect(); if (activeSource === source) activeSource = null; };
      source.start(0);
    } catch (_) {}
  }
  function clickSound(pitch = 740) {
    if (!audio || !master) return;
    try {
      const oscillator = audio.createOscillator(), envelope = audio.createGain();
      const now = audio.currentTime;
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(pitch, now);
      oscillator.frequency.setValueAtTime(pitch * 1.5, now + 0.025);
      envelope.gain.setValueAtTime(0.0001, now);
      envelope.gain.linearRampToValueAtTime(0.065, now + 0.003);
      envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      oscillator.connect(envelope); envelope.connect(master);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(now); oscillator.stop(now + 0.08);
    } catch (_) {}
  }
  async function loadMedia() {
    phase = 'loading'; ready = false;
    numbers.forEach(button => { button.disabled = true; });
    $('retry').hidden = true; $('feedback').textContent = 'Loading…';
    try {
      const audioTask = (async () => {
        const AudioEngine = window.AudioContext || window.webkitAudioContext;
        if (!AudioEngine) throw new Error('Audio unavailable');
        if (!audio) {
          audio = new AudioEngine({latencyHint:'interactive'});
          master = audio.createGain(); master.gain.value = 1;
          master.connect(audio.destination);
        }
        if (cue) return;
        const response = await fetch('assets/jumpscare.mp3?v=20s');
        if (!response.ok) throw new Error('Audio download failed');
        cue = await audio.decodeAudioData(await response.arrayBuffer());
      })();
      const scareImage = $('scare-image');
      if (scareImage.complete && !scareImage.naturalWidth) {
        scareImage.src = `assets/scare.png?retry=${Date.now()}`;
      }
      await Promise.all([audioTask, scareImage.decode()]);
      ready = true; phase = 'playing';
      numbers.forEach(button => { button.disabled = false; });
      $('feedback').textContent = '';
    } catch (_) {
      phase = 'load-error';
      $('feedback').textContent = 'Couldn’t finish loading. Try again.';
      $('retry').hidden = false;
    }
  }
  function openGiftLink() {
    const url = $('reveal').href;
    cancelTimers(); stopAudio();
    window.location.assign(url);
    return {navigating:true, url};
  }
  function startSurprise() {
    phase = 'glitch';
    numbers.forEach(button => { button.disabled = true; });
    document.body.classList.add('glitching');
    later(() => {
      phase = 'scare';
      $('game').hidden = true; document.body.classList.remove('glitching');
      // Show the image and start the decoded sound in the same task: no fade-in.
      $('scare').hidden = false; playCue();
      $('scare').focus({preventScroll:true});
      history.replaceState(null, '', '#surprise');
      later(() => {
        $('reveal').hidden = false;
        $('reveal').focus({preventScroll:true});
      }, REVEAL_BUTTON_MS);
    }, GLITCH_MS);
  }
  function chooseNumber(number) {
    if (phase !== 'playing' || !ready) return {accepted:false, phase};
    const button = numbers.find(item => Number(item.dataset.number) === number);
    if (!button || button.disabled) return {accepted:false, phase, next};
    if (number !== next) {
      button.classList.remove('wrong'); void button.offsetWidth; button.classList.add('wrong');
      $('feedback').textContent = `Select ${next} first.`;
      return {accepted:false, phase, next};
    }
    button.disabled = true; button.classList.add('done');
    button.setAttribute('aria-label', `Number ${number}, selected`);
    next++; $('feedback').textContent = '';
    if (number === 3) startSurprise();
    return {accepted:true, phase, next:phase === 'playing' ? next : null};
  }
  function resetGame() {
    cancelTimers(); stopAudio(); next = 1; phase = ready ? 'playing' : 'loading';
    document.body.classList.remove('glitching');
    $('game').hidden = false; $('scare').hidden = true; $('birthday').hidden = true; $('reveal').hidden = true;
    $('birthday').classList.remove('arriving');
    numbers.forEach(button => { button.disabled = !ready; button.classList.remove('done','wrong'); button.setAttribute('aria-label',`Select number ${button.dataset.number}`); });
    $('feedback').textContent = ''; document.title = "Brianna's Birthday Zone";
    history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo(0,0); numbers[0].focus({preventScroll:true});
  }
  numbers.forEach(button => button.addEventListener('click', () => {
    unlockAudio(); clickSound(560 + Number(button.dataset.number) * 130);
    chooseNumber(Number(button.dataset.number));
  }));
  $('retry').addEventListener('click', () => { unlockAudio(); clickSound(); void loadMedia(); });
  $('replay').addEventListener('click', () => { unlockAudio(); resetGame(); clickSound(); });
  // Keep native same-tab link navigation; do not preventDefault or show a local overlay.
  $('reveal').addEventListener('click', () => { unlockAudio(); stopAudio(); clickSound(980); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAudio();
    else if (['scare','birthday'].includes(phase) && !activeSource) { unlockAudio(); playCue(); }
  });
  window.addEventListener('pagehide', stopAudio);
  window.addEventListener('pageshow', () => {
    if (['scare','birthday'].includes(phase) && !activeSource) { unlockAudio(); playCue(); }
  });
  ['gesturestart','gesturechange','gestureend'].forEach(type => document.addEventListener(type, event => event.preventDefault(), {passive:false}));
  document.addEventListener('touchmove', event => { if (event.touches.length > 1) event.preventDefault(); }, {passive:false});
  document.addEventListener('dblclick', event => event.preventDefault(), {passive:false});
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  void loadMedia();
  const context = document.modelContext;
  if (context?.registerTool) {
    const lifecycle = new AbortController();
    const register = tool => { try { Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(() => {}); } catch (_) {} };
    register({name:'read_number_puzzle',description:'Read the birthday number puzzle state.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:() => ({phase,nextNumber:phase === 'playing' ? next : null,completed:next - 1,loopActive:!!activeSource,ready})});
    register({name:'choose_puzzle_number',description:'Select 1, 2, then 3 in the visible puzzle. Selecting 3 triggers a 140 ms glitch, then a continuously looping horror image and recording. A centered Click here link appears and leads to the Amazon gift page in the same tab. Sound requires a previous visitor gesture.',inputSchema:{type:'object',properties:{number:{type:'integer',minimum:1,maximum:3}},required:['number'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input => { if (!input || !Number.isInteger(input.number) || input.number < 1 || input.number > 3) throw new Error('Choose 1, 2, or 3.'); return chooseNumber(input.number); }});
    register({name:'open_amazon_gift_link',description:'Leave the birthday page and navigate this browser tab to the Amazon gift URL used by the visible Click here link.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:openGiftLink});
    window.addEventListener('pagehide',() => lifecycle.abort(),{once:true});
  }
})();
