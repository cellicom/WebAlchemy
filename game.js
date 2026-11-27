'use strict';
const $ = s => document.querySelector(s);
const SAVE = 'webalchemy.save', SET = 'webalchemy.settings';
const LINK = 'https://linktr.ee/cellicom';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };

const T = {
  it: { goals: 'Obiettivi', clear: 'Pulisci', settings: 'Opzioni', close: 'Chiudi', search: 'Cerca…',
    hint: 'Tocca un elemento nella lista, poi trascinane uno sopra un altro per combinarli.',
    found: 'Trovati', new: 'Nuovo: ', info: 'Come si ottiene', base: 'Elemento base',
    free: 'Modalità libera', list: 'Lista elementi', forge: 'Modalità fornace', combine: 'Combina', fhint: 'Tocca due elementi nella lista, poi premi Combina.', lang: 'Lingua', theme: 'Tema', auto: 'Automatica', sound: 'Suoni', reset: 'Azzera progressi', sure: 'Cancellare tutti i progressi? Non si può annullare.', yes: 'Sì, cancella tutto',
    about: 'Informazioni', find: 'Trova ', reach: 'Scopri elementi: ', goal: 'Obiettivo completato!',
    desc: 'WebAlchemy è un gioco di alchimia: parti da pochi elementi base e combinali per scoprirne di nuovi, fino a ' + EL.length + ' elementi. Il progresso viene salvato automaticamente.',
    del: 'Trascina un elemento sulla lista per eliminarlo, doppio tocco per duplicarlo.' },
  en: { goals: 'Goals', clear: 'Clear', settings: 'Settings', close: 'Close', search: 'Search…',
    hint: 'Tap an element in the list, then drag one onto another to combine them.',
    found: 'Found', new: 'New: ', info: 'How to get it', base: 'Base element',
    free: 'Free mode', list: 'Element list', forge: 'Forge mode', combine: 'Combine', fhint: 'Tap two elements in the list, then press Combine.', lang: 'Language', theme: 'Theme', auto: 'Automatic', sound: 'Sound', reset: 'Reset progress', sure: 'Delete all progress? This cannot be undone.', yes: 'Yes, delete everything',
    about: 'About', find: 'Find ', reach: 'Discover elements: ', goal: 'Goal completed!',
    desc: 'WebAlchemy is an alchemy game: start from a few base elements and combine them to discover new ones, up to ' + EL.length + ' elements. Progress is saved automatically.',
    by: 'Created by', del: 'Drag an element onto the list to delete it, double tap to duplicate it.' }
};
let settings = Object.assign({ lang: 'auto', sound: true, theme: 'arcade' }, load(SET, {}));
let save = load(SAVE, null) || { found: {}, board: [] };
save.goals = save.goals || {};
BASE.forEach(id => { if (!(id in save.found)) save.found[id] = null; });


// [bg, bg2, ink, accent, pink, cyan, dark, name it, name en]
const THEMES = {
  arcade: ['#2b1b4d', '#3d2a6b', '#fff7e0', '#ffe66d', '#ff4fa3', '#4de1ff', '#150d28', 'Classico', 'Classic'],
  forest: ['#12301c', '#1f4d2e', '#eaf7e4', '#6fdc6f', '#3fa34d', '#a8e6a1', '#0a1c10', 'Foresta', 'Forest'],
  vaporwave: ['#1a0b2e', '#2d1450', '#fdf0ff', '#01cdfe', '#ff2bd6', '#ff71ce', '#0f0620', 'Vaporwave', 'Vaporwave'],
  gameboy: ['#a9a9a2', '#c6c5bd', '#25253a', '#9a2257', '#2b2b45', '#4a4a6a', '#d8d7cf', 'Game Boy', 'Game Boy'],
  white: ['#f4f4f4', '#e2e2e2', '#1a1a1a', '#1a73e8', '#e91e63', '#00796b', '#ffffff', 'Bianco', 'White'],
  black: ['#000000', '#1a1a1a', '#f2f2f2', '#f0f0f0', '#8a8a8a', '#bdbdbd', '#0a0a0a', 'Nero', 'Black']
};
function applyTheme() {
  const v = THEMES[settings.theme] || THEMES.arcade;
  ['bg', 'bg2', 'ink', 'acc', 'pink', 'cy', 'dark'].forEach((k, i) => document.documentElement.style.setProperty('--' + k, v[i]));
  document.querySelector('meta[name=theme-color]').content = v[0];
}
applyTheme();

const lang = () => settings.lang === 'auto' ? ((navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en') : settings.lang;
const t = k => T[lang()][k];
const name = id => EL[id][lang() === 'it' ? 0 : 1];
const persist = () => { localStorage.setItem(SAVE, JSON.stringify(save)); localStorage.setItem(SET, JSON.stringify(settings)); };

// 32x32 pixel icon: emoji drawn small, hard-quantised to 4 levels/channel, with a 1px outline
const icons = {}, canv = {}, sils = {};
const icon = id => pix(EL[id][2]);
// same icon painted all black: only the silhouette shows
function sil(id) {
  const ch = EL[id][2]; if (sils[ch]) return sils[ch]; pix(ch);
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
  x.drawImage(canv[ch], 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#000'; x.fillRect(0, 0, 32, 32);
  return sils[ch] = c.toDataURL();
}
// 8-bit look: emoji drawn 4x larger, downsampled to 32x32, mapped to a fixed 32-colour palette (DawnBringer DB32)
// with light ordered dithering and a 1px dark outline. The previous version is in backup/pre-8bit/.
const PAL = '000000 222034 45283c 663931 8f563b df7126 d9a066 eec39a fbf236 99e550 6abe30 37946e 4b692f 524b24 323c39 3f3f74 306082 5b6ee1 639bff 5fcde4 cbdbfc ffffff 9badb7 847e87 696a6a 595652 76428a ac3232 d95763 d77bba 8f974a 8a6f30'
  .split(' ').map(h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4), 16)]);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const OUTLINE = PAL[1];
function nearest(r, g, b) {
  let best = 0, bd = 1e9;
  for (let i = 0; i < PAL.length; i++) {
    const p = PAL[i], dr = r - p[0], dg = g - p[1], db = b - p[2];
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db; // weighted towards how the eye sees colour
    if (dist < bd) { bd = dist; best = i; }
  }
  return PAL[best];
}
function pix(ch) {
  if (icons[ch]) return icons[ch];
  const big = document.createElement('canvas'); big.width = big.height = 128;
  const bx = big.getContext('2d');
  bx.font = '100px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  bx.textAlign = 'center'; bx.textBaseline = 'middle'; bx.fillText(ch, 64, 68);
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.imageSmoothingQuality = 'high'; x.drawImage(big, 0, 0, 32, 32);
  const im = x.getImageData(0, 0, 32, 32), d = im.data;
  const mask = Array.from({ length: 1024 }, (_, i) => d[i * 4 + 3] >= 110);
  for (let i = 0; i < 1024; i++) {
    const o = i * 4, px = i % 32, py = i >> 5;
    if (mask[i]) {
      const t = (BAYER[(py % 4) * 4 + px % 4] / 16 - .5) * 28;
      const p = nearest(d[o] + t, d[o + 1] + t, d[o + 2] + t);
      d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = 255;
    } else {
      const n = (px > 0 && mask[i - 1]) || (px < 31 && mask[i + 1]) || (py > 0 && mask[i - 32]) || (py < 31 && mask[i + 32]);
      d[o] = OUTLINE[0]; d[o + 1] = OUTLINE[1]; d[o + 2] = OUTLINE[2]; d[o + 3] = n ? 255 : 0;
    }
  }
  x.putImageData(im, 0, 0);
  canv[ch] = c;
  return icons[ch] = c.toDataURL();
}

let ac;
function beep(f, ms = 90, type = 'square') {
  if (!settings.sound) return;
  try {
    ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = .05; o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + ms / 1000);
  } catch {}
}

function toast(msg, id) {
  const e = $('#toast'); e.textContent = msg; e.classList.add('on');
  if (id !== undefined) { const i = new Image(); i.src = icon(id); e.prepend(i); }
  clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 2200);
}

const byKey = k => EL.findIndex(e => e[0].toLowerCase() === k);
const MILE = [[10, 'Apprendista', 'Apprentice'], [25, 'Sperimentatore', 'Experimenter'], [50, 'Alchimista', 'Alchemist'], [100, 'Maestro alchimista', 'Master alchemist'],
  [200, 'Mago', 'Wizard'], [300, 'Arcimago', 'Archmage'], [400, 'Leggenda', 'Legend'], [500, 'Quasi onnisciente', 'Almost omniscient'], [EL.length, 'Pietra filosofale', "Philosopher's stone"]];
const count = () => Object.keys(save.found).length;
const GOALS = MILE.map(([n, it, en]) => ({ key: 'n' + n, ico: '★', title: () => lang() === 'it' ? it : en, desc: () => t('reach') + n, ok: () => count() >= n }))
  .concat(['umano', 'vita', 'drago', 'unicorno', 'robot', 'internet', 'babbo natale', 'tardis', 'godzilla', 'titanic', 'vampiro', 'pizza', 'sirena', 'spazio']
    .map(byKey).map(id => ({ key: 'f' + id, ico: id, title: () => name(id), desc: () => t('find') + name(id), ok: () => id in save.found })));
// records the date the first time a goal is met; returns the newly completed ones
function checkGoals() {
  const n = GOALS.filter(g => g.ok() && !save.goals[g.key]); n.forEach(g => save.goals[g.key] = Date.now()); return n;
}
const goalsDone = () => Object.keys(save.goals).length;
checkGoals();

let justFound = null;
function renderList() {
  const q = $('#search').value.trim().toLowerCase(), l = lang();
  const ids = Object.keys(save.found).map(Number).filter(i => name(i).toLowerCase().includes(q))
    .sort((a, b) => name(a).localeCompare(name(b), l));
  $('#list').innerHTML = ids.map(i => `<div class="cell${i === justFound ? ' new' : ''}" data-id="${i}"><i data-info="${i}"><img src="${pix('ℹ️')}" alt="info"></i><img src="${icon(i)}" alt=""><div>${name(i)}</div></div>`).join('');
  $('#count').textContent = `${t('found')} ${Object.keys(save.found).length}/${EL.length}`;
}
function renderText() {
  document.documentElement.lang = lang();
  [['f-go', 'combine'],  ['list', 'list'], ['goals', 'goals'], ['clear', 'clear'], ['settings', 'settings']].forEach(([id, k]) => { const b = $(id.startsWith('f-') ? '#' + id : '#b-' + id); b.title = b.ariaLabel = t(k); });
  $('#search').placeholder = t('search'); $('#dlg-close').title = $('#l-close').title = t('close');
  $('#hint').textContent = t('hint'); $('#f-hint').textContent = t('fhint'); $('#f-go').title = $('#f-go').ariaLabel = t('combine'); if (typeof modeBtn === 'function') modeBtn();
  $('#foot').innerHTML = `v${VERSION} · Created by <span class="heart">&hearts;</span> <a href="${LINK}" target="_blank" rel="noopener">cellicom</a>`;
  renderList();
}

const board = $('#board');
const items = () => [...board.querySelectorAll('.item')];
function spawn(id, x, y, pop) {
  const e = document.createElement('div');
  e.className = 'item' + (pop ? ' pop' : ''); e.dataset.id = id;
  e.innerHTML = `<img src="${icon(id)}" alt=""><div>${name(id)}</div>`;
  place(e, x, y); board.appendChild(e); $('#hint').style.display = 'none';
}
function place(e, x, y) {
  const r = board.getBoundingClientRect();
  e.style.left = Math.max(0, Math.min(r.width - 72, x)) + 'px'; e.style.top = Math.max(0, Math.min(r.height - 90, y)) + 'px';
}
const pos = e => ({ x: parseFloat(e.style.left), y: parseFloat(e.style.top) });
function saveBoard() { save.board = items().map(e => ({ id: +e.dataset.id, ...pos(e) })); persist(); }

// looks up a recipe, records a first discovery; returns the result id or undefined
function resolve(ia, ib) {
  const res = REC[Math.min(ia, ib) + ',' + Math.max(ia, ib)];
  if (!res) return;
  const r = res.find(i => !(i in save.found)) ?? res[0];
  if (!(r in save.found)) {
    save.found[r] = [ia, ib]; justFound = r; beep(660); setTimeout(() => beep(880), 90);
    toast(t('new') + name(r), r); renderList();
    const g = checkGoals(); if (g.length) setTimeout(() => { toast('★ ' + t('goal') + ' ' + g[0].title()); beep(1040, 200); }, 1500);
    persist();
  }
  return r;
}
const shake = els => els.forEach(e => { e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); });
function combine(a, b) {
  const r = resolve(+a.dataset.id, +b.dataset.id);
  if (r === undefined) { shake([a, b]); beep(110, 150, 'sawtooth'); saveBoard(); return; }
  const pa = pos(a), pb = pos(b);
  a.remove(); b.remove();
  spawn(r, (pa.x + pb.x) / 2, (pa.y + pb.y) / 2, true);
  saveBoard();
}

// forge mode: exactly two slots and a Combine button
let forgeOn = false;
const slots = [null, null];
function renderForge() {
  document.querySelectorAll('.slot').forEach((el, i) => { el.innerHTML = slots[i] === null ? '' : `<img src="${icon(slots[i])}" alt=""><div>${name(slots[i])}</div>`; });
}
function setForge(on) {
  forgeOn = on; $('#forge').hidden = !on; board.style.display = on ? 'none' : ''; document.body.classList.toggle('forge-on', on); modeBtn();
}
// one button: shows the current mode's icon, tooltip names the mode it switches to
function modeBtn() {
  const b = $('#b-forge'); b.innerHTML = `<img src="${pix(forgeOn ? '🔥' : '🧪')}" alt="">`; b.title = b.ariaLabel = t(forgeOn ? 'free' : 'forge');
}
$('#b-forge').onclick = () => setForge(!forgeOn);
document.querySelectorAll('.slot').forEach((el, i) => el.onclick = () => { slots[i] = null; renderForge(); });
// on phones the Combine button sits inside the third square; it gives way to the result for 3 seconds
const phone = matchMedia('(max-width:700px)');
let outTimer;
function resetOut() { clearTimeout(outTimer); $('#f-out').innerHTML = ''; $('#f-go').hidden = false; }
function placeBtn() { (phone.matches ? $('#f-res') : $('#forge')).appendChild($('#f-go')); }
phone.addEventListener('change', placeBtn); placeBtn();
$('#f-go').onclick = () => {
  resetOut();
  if (slots[0] === null || slots[1] === null) { shake([...document.querySelectorAll('.slot')]); beep(110, 150, 'sawtooth'); return; }
  const r = resolve(slots[0], slots[1]);
  if (r === undefined) { shake([...document.querySelectorAll('.slot')]); beep(110, 150, 'sawtooth'); return; }
  slots[0] = slots[1] = null; renderForge();
  $('#f-out').innerHTML = `<div class="item pop" style="position:static;margin:auto"><img src="${icon(r)}" alt=""><div>${name(r)}</div></div>`;
  if (phone.matches) { $('#f-go').hidden = true; outTimer = setTimeout(resetOut, 3000); }
};

let drag0, drag = null, z = 10, last = { e: null, t: 0 };
board.addEventListener('pointerdown', ev => {
  const e = ev.target.closest('.item'); if (!e) return;
  const p = pos(e), r = board.getBoundingClientRect(); drag0 = { x: ev.clientX, y: ev.clientY };
  drag = { e, dx: ev.clientX - r.left - p.x, dy: ev.clientY - r.top - p.y };
  e.classList.add('drag'); e.setPointerCapture(ev.pointerId); e.style.zIndex = ++z;
});
board.addEventListener('pointermove', ev => {
  if (!drag) return; const r = board.getBoundingClientRect();
  place(drag.e, ev.clientX - r.left - drag.dx, ev.clientY - r.top - drag.dy);
});
function endDrag(ev) {
  if (!drag) return; const e = drag.e; drag = null; e.classList.remove('drag');
  const p = $('#panel').getBoundingClientRect();
  if (ev.clientX >= p.left && ev.clientX <= p.right && ev.clientY >= p.top && ev.clientY <= p.bottom) { e.remove(); saveBoard(); return; }
  const moved = Math.hypot(ev.clientX - drag0.x, ev.clientY - drag0.y) > 6;
  if (!moved) { // tap: two taps on the same item duplicate it
    if (last.e === e && Date.now() - last.t < 400) { const p = pos(e); spawn(+e.dataset.id, p.x + 24, p.y + 24); saveBoard(); last = { e: null, t: 0 }; }
    else last = { e, t: Date.now() };
    return;
  }
  last = { e: null, t: 0 };
  const me = pos(e), o = items().find(o => o !== e && Math.hypot(pos(o).x - me.x, pos(o).y - me.y) < 56);
  o ? combine(e, o) : saveBoard();
}
board.addEventListener('dragstart', e => e.preventDefault()); // native image drag would cancel the pointer drag
board.addEventListener('pointerup', endDrag);
board.addEventListener('pointercancel', endDrag);
$('#list').addEventListener('click', ev => {
  const inf = ev.target.closest('[data-info]');
  if (inf) return showInfo(+inf.dataset.info);
  const c = ev.target.closest('.cell'); if (!c) return;
  if (forgeOn) { const i = slots.indexOf(null); slots[i < 0 ? 1 : i] = +c.dataset.id; resetOut(); return renderForge(); }
  const r = board.getBoundingClientRect();
  spawn(+c.dataset.id, 20 + Math.random() * Math.max(0, r.width - 112), 20 + Math.random() * Math.max(0, r.height - 130), true); saveBoard();
});
$('#search').addEventListener('input', renderList);

const dlg = $('#dlg');
function open(html) { $('#dlg-body').innerHTML = html; $('#dlg-actions').innerHTML = ''; if (!dlg.open) dlg.showModal(); }
$('#dlg-close').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
function showInfo(id) {
  const c = save.found[id];
  open(`<h2>${name(id)}</h2><img src="${icon(id)}" alt=""><p>${t('info')}:</p>` + (c
    ? `<div class="combo"><img src="${icon(c[0])}" alt=""> ${name(c[0])} + <img src="${icon(c[1])}" alt=""> ${name(c[1])}</div>`
    : `<p>${t('base')}</p>`));
}
$('#b-goals').onclick = () => open(`<h2>${t('goals')} ${goalsDone()}/${GOALS.length}</h2>` + GOALS.map(g => {
  const d = save.goals[g.key], ico = typeof g.ico === 'number' ? `<img src="${icon(g.ico)}" alt="">` : `<span class="star">${g.ico}</span>`;
  return `<div class="goal${d ? ' done' : ''}">${ico}<div><b>${g.title()}</b><br><small>${g.desc()}</small></div><small class="date">${d ? new Date(d).toLocaleDateString(lang(), { day: 'numeric', month: 'short', year: 'numeric' }) : '🔒'}</small></div>`;
}).join(''));

// full-screen element list: found ones show icon + the combination that made them, hidden ones a black silhouette
const REQ = {};
for (const [k, res] of Object.entries(REC)) for (const r of res) (REQ[r] = REQ[r] || []).push(k.split(',').map(Number));
const part = id => id in save.found ? `<span class="p"><img src="${icon(id)}" alt="">${name(id)}</span>` : '<span class="p q">????</span>';
let listToken = 0;
// what a row shows: its parts are the two ingredients (found: the real recipe, hidden: the best partly-known one)
function rowParts(i) {
  if (i in save.found) return save.found[i];
  const known = p => p.filter(x => x in save.found).length;
  return (REQ[i] || [[-1, -1]]).reduce((m, p) => known(p) > known(m) ? p : m);
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
// search only sees what the row reveals: the element name if found, plus the ingredients already found
const rowText = i => norm([i in save.found ? name(i) : '', ...(rowParts(i) || []).filter(x => x in save.found).map(name)].join(' '));
function rowHtml(i) {
  const got = i in save.found, p = rowParts(i);
  const combo = p ? `${part(p[0])} + ${part(p[1])}` : t('base');
  return `<div class="lrow${got ? '' : ' hid'}"><img src="${got ? icon(i) : sil(i)}" alt=""><b>${got ? name(i) : '?????'}</b><span class="combo">${combo}</span></div>`;
}
function showList() {
  const dl = $('#dlg-list'), l = lang(), tok = ++listToken, q = norm($('#l-search').value.trim());
  const ids = EL.map((_, i) => i).sort((a, b) => name(a).localeCompare(name(b), l)).filter(i => !q || rowText(i).includes(q));
  $('#l-title').textContent = `${t('list')} ${count()}/${EL.length}`;
  $('#l-search').placeholder = t('search');
  $('#l-body').innerHTML = '';
  if (!dl.open) dl.showModal(); // open first, then fill in small batches so the page never freezes
  let n = 0;
  const step = () => {
    if (tok !== listToken) return;
    $('#l-body').insertAdjacentHTML('beforeend', ids.slice(n, n + 25).map(rowHtml).join(''));
    if ((n += 25) < ids.length) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
$('#b-list').onclick = () => { $('#l-search').value = ''; showList(); };
$('#l-search').addEventListener('input', showList);
$('#l-close').onclick = () => { listToken++; $('#dlg-list').close(); };
$('#dlg-list').addEventListener('close', () => listToken++);
function showAbout() { open(`<h2>WebAlchemy</h2><img src="logo.svg" alt="" style="width:100%;height:auto"><small>v${VERSION}</small><p>${t('desc')}</p><p>${t('del')}</p>
  <p>Created by <span class="heart">&hearts;</span> <a href="${LINK}" target="_blank" rel="noopener">cellicom</a></p>`); }
$('#b-clear').onclick = () => { // clears whichever mode is active
  if (forgeOn) { slots[0] = slots[1] = null; resetOut(); renderForge(); return; }
  items().forEach(e => e.remove()); $('#hint').style.display = ''; saveBoard();
};
// flags drawn on a tiny canvas so they stay pixelated like the icons
function flag(v) {
  const c = document.createElement('canvas'); c.width = 20; c.height = 12; const x = c.getContext('2d');
  const r = (col, X, Y, w, h) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
  if (v === 'it') { r('#009246', 0, 0, 7, 12); r('#fff', 7, 0, 6, 12); r('#ce2b37', 13, 0, 7, 12); }
  else {
    r('#012169', 0, 0, 20, 12);
    for (let i = 0; i < 20; i++) for (const y of [Math.round(i * 11 / 19), 11 - Math.round(i * 11 / 19)]) { r('#fff', i, Math.max(0, y - 1), 1, 3); r('#c8102e', i, y, 1, 1); }
    r('#fff', 0, 4, 20, 4); r('#fff', 8, 0, 4, 12); r('#c8102e', 0, 5, 20, 2); r('#c8102e', 9, 0, 2, 12);
  }
  return c.toDataURL();
}
function showSettings() {
  open(`<h2>${t('settings')}</h2>
  <div class="row"><span>${t('lang')}</span><span class="icons">${['it', 'en'].map(v => `<button class="btn ic${lang() === v ? ' on' : ''}" data-lang="${v}" title="${v === 'it' ? 'Italiano' : 'English'}"><img src="${flag(v)}" alt="" class="flag"></button>`).join('')}</span></div>
  <div class="row"><span>${t('theme')}</span><span class="icons">${Object.entries(THEMES).map(([k, v]) => `<button class="btn sw${settings.theme === k ? ' on' : ''}" data-theme="${k}" title="${v[lang() === 'it' ? 7 : 8]}" style="background:linear-gradient(135deg,${v[0]} 50%,${v[3]} 50%)"></button>`).join('')}</span></div>
  <div class="row"><span>${t('sound')}</span><button class="btn ic${settings.sound ? ' on' : ''}" id="s-snd" title="${t('sound')}"><img src="${pix(settings.sound ? '🔊' : '🔇')}" alt=""></button></div>
  <div class="row"><span>${t('about')}</span><button class="btn ic" id="s-about" title="${t('about')}"><img src="${pix('❓')}" alt=""></button></div>
  <div class="row"><span>${t('reset')}</span><button class="btn ic red" id="s-reset" title="${t('reset')}"><img src="${pix('🗑️')}" alt=""></button></div>`);
  dlg.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
    settings.lang = b.dataset.lang; persist(); renderText();
    items().forEach(i => i.lastChild.textContent = name(+i.dataset.id)); showSettings();
  });
  dlg.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { settings.theme = b.dataset.theme; persist(); applyTheme(); showSettings(); });
  $('#s-about').onclick = showAbout;
  $('#s-snd').onclick = () => { settings.sound = !settings.sound; persist(); showSettings(); };
  $('#s-reset').onclick = () => {
    open(`<div class="warn"><img src="${pix('⚠️')}" alt=""><h2 class="red-t">${t('reset')}</h2><p>${t('sure')}</p></div>`);
    $('#dlg-actions').innerHTML = `<button class="btn red" id="s-yes">${t('yes')}</button>`;
    $('#s-yes').onclick = () => { localStorage.removeItem(SAVE); location.reload(); };
  };
}
$('#b-settings').onclick = showSettings;

[['f-go', '✨'],  ['list', '📋'], ['goals', '🏆'], ['clear', '🧹'], ['settings', '⚙️']].forEach(([id, e]) => $(id.startsWith('f-') ? '#' + id : '#b-' + id).innerHTML = `<img src="${pix(e)}" alt="">`);
['#dlg-close', '#l-close'].forEach(q => { $(q).classList.add('ic'); $(q).innerHTML = `<img src="${pix('❌')}" alt="X">`; });
renderText(); modeBtn(); save.board.forEach(b => spawn(b.id, b.x, b.y)); persist();
