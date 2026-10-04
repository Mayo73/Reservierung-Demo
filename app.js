/* Ihr Bistro – Tischreservierung (Demo) */
(function () {
  'use strict';

  /* ===================== Grunddaten ===================== */

  const SLOTS = [];
  for (let m = 17 * 60; m <= 22 * 60; m += 30) SLOTS.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));

  const STAY = 4;          // eine Reservierung belegt 4 Slots (2 Stunden)
  const BOOK_AHEAD = 90;   // Tage im Voraus buchbar
  const CLOSED_DAY = 1;    // Montag ist Ruhetag
  const MAX_GUESTS = 8;
  const STORE_KEY = 'ihr-bistro-demo-v1';
  const FRAME_W = 414;
  const FRAME_H = 868;

  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const DAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];

  const CH_D = 13;  // Stuhltiefe im Plan
  const CH_IN = 3;  // so weit ragt ein Stuhl unter die Tischplatte

  const AREAS = {
    innen: { label: 'Innenbereich', icon: 'house' },
    terrasse: { label: 'Terrasse', icon: 'sun' }
  };

  const FEATURES = {
    beliebt: { label: 'Beliebter Tisch', icon: 'star' },
    fenster: { label: 'Fensterplatz', icon: 'window' },
    nische: { label: 'Ruhige Nische', icon: 'moon' },
    runde: { label: 'Große Runde', icon: 'users' },
    mitte: { label: 'Mitten im Raum', icon: 'spark' },
    bar: { label: 'Nahe der Bar', icon: 'glass' },
    eingang: { label: 'Nahe dem Eingang', icon: 'door' },
    garten: { label: 'Am Kräuterbeet', icon: 'leaf' },
    schirm: { label: 'Mit Sonnenschirm', icon: 'umbrella' },
    abend: { label: 'Abendsonne', icon: 'sunset' }
  };

  const OCCASIONS = [
    ['none', 'Kein Anlass'],
    ['geburtstag', 'Geburtstag'],
    ['jahrestag', 'Jahrestag'],
    ['geschaeft', 'Geschäftsessen']
  ];

  // Koordinaten im Plan-Koordinatensystem (viewBox 96 346 764 680)
  const TABLES = [
    { id: 1, area: 'innen', shape: 'rect', x: 365, y: 450, w: 66, h: 46, chairs: { left: 1, right: 1 }, min: 1, feature: 'fenster' },
    { id: 2, area: 'innen', shape: 'rect', x: 502, y: 450, w: 66, h: 46, chairs: { left: 1, right: 1 }, min: 1, feature: 'fenster' },
    { id: 3, area: 'innen', shape: 'rect', x: 154, y: 598, w: 44, h: 60, chairs: { top: 1, bottom: 1 }, min: 1, feature: 'nische' },
    { id: 4, area: 'innen', shape: 'rect', x: 323, y: 575, w: 72, h: 84, chairs: { top: 2, bottom: 2, left: 2, right: 2 }, min: 4, feature: 'runde' },
    { id: 5, area: 'innen', shape: 'rect', x: 482, y: 575, w: 52, h: 84, chairs: { top: 1, bottom: 1, left: 2, right: 2 }, min: 3, feature: 'mitte' },
    { id: 6, area: 'innen', shape: 'round', x: 391, y: 697, r: 30, seats: 4, min: 2, feature: 'beliebt' },
    { id: 7, area: 'innen', shape: 'rect', x: 530, y: 718, w: 52, h: 84, chairs: { top: 1, bottom: 1, left: 2, right: 2 }, min: 3, feature: 'fenster' },
    { id: 8, area: 'innen', shape: 'rect', x: 273, y: 768, w: 52, h: 84, chairs: { top: 1, bottom: 1, left: 2, right: 2 }, min: 3, feature: 'bar' },
    { id: 9, area: 'innen', shape: 'round', x: 417, y: 822, r: 32, seats: 4, min: 2, feature: 'beliebt' },
    { id: 10, area: 'innen', shape: 'rect', x: 350, y: 905, w: 74, h: 48, chairs: { top: 2, bottom: 2 }, min: 2, feature: 'eingang' },
    { id: 11, area: 'innen', shape: 'rect', x: 505, y: 905, w: 74, h: 48, chairs: { top: 2, bottom: 2 }, min: 2 },
    { id: 12, area: 'terrasse', shape: 'rect', x: 722, y: 498, w: 62, h: 56, chairs: { top: 2, bottom: 2, left: 1, right: 1 }, min: 3, feature: 'garten' },
    { id: 13, area: 'terrasse', shape: 'round', x: 719, y: 653, r: 30, seats: 4, min: 2, feature: 'schirm' },
    { id: 14, area: 'terrasse', shape: 'rect', x: 725, y: 778, w: 62, h: 56, chairs: { top: 2, bottom: 2, left: 1, right: 1 }, min: 3, feature: 'garten' },
    { id: 15, area: 'terrasse', shape: 'round', x: 720, y: 933, r: 30, seats: 4, min: 2, feature: 'abend' }
  ];
  TABLES.forEach(function (t) { t.max = chairsOf(t).length; });

  // Reihenfolge für die Vorauswahl beim Start
  const PREFERRED = [6, 9, 1, 2, 7, 5, 10, 11, 3, 13, 15, 12, 14, 8, 4];

  /* ===================== Icons ===================== */

  const ICONS = {
    back: '<path d="M20 12H5"/><path d="M11 5.5 4.5 12l6.5 6.5"/>',
    heart: '<path d="M12 20.2s-7.4-4.5-9-9.2C1.9 7.7 4 4.6 7.3 4.6c2 0 3.5 1.1 4.7 2.8 1.2-1.7 2.7-2.8 4.7-2.8 3.3 0 5.4 3.1 4.3 6.4-1.6 4.7-9 9.2-9 9.2z"/>',
    dots: '<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8.4" r="3.3"/><path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><path d="M15.3 5.4a3.2 3.2 0 0 1 0 6.1"/><path d="M17.5 14.5c2 .7 3.3 2.4 3.6 5"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3 2"/>',
    chevDown: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    chevRight: '<path d="m9.5 6 6 6-6 6"/>',
    chevLeft: '<path d="m14.5 6-6 6 6 6"/>',
    arrow: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    house: '<path d="M4 10.6 12 4l8 6.6V20H4z"/>',
    star: '<path d="m12 3.3 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.8z" fill="currentColor"/>',
    window: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M12 3.5v17M5 12h14"/>',
    moon: '<path d="M19 14.6A7.6 7.6 0 0 1 9.4 5a7.6 7.6 0 1 0 9.6 9.6z"/>',
    spark: '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4"/><circle cx="12" cy="12" r="1.9"/>',
    glass: '<path d="M7 4h10l-1 6.2a4 4 0 0 1-8 0z"/><path d="M12 14.4V20M8.5 20h7"/>',
    door: '<path d="M6.5 20.5v-16a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M4 20.5h16"/><circle cx="14.6" cy="12.4" r=".9" fill="currentColor"/>',
    leaf: '<path d="M5 19.5C5 11.5 10 6 19.5 4.5c0 9.5-5.5 15-14.5 15"/><path d="m5 19.5 7.5-7.5"/>',
    umbrella: '<path d="M3.5 12a8.5 8.5 0 0 1 17 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/><path d="M12 3.5V2.4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
    sunset: '<path d="M7.5 16.5a4.5 4.5 0 0 1 9 0"/><path d="M3 20h18M12 6.5v3M5.4 10.6l1.8 1.8M18.6 10.6l-1.8 1.8M2.8 16.5H5M19 16.5h2.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    list: '<rect x="4" y="4" width="16" height="16.5" rx="2.5"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4.2h4.2"/>',
    tap: '<path d="M9 11.5V5.6a1.6 1.6 0 0 1 3.2 0v5.2"/><path d="M12.2 10a1.6 1.6 0 0 1 3.2 0v1.3"/><path d="M15.4 10.8a1.6 1.6 0 0 1 3.2 0v3.4a6.3 6.3 0 0 1-6.3 6.3h-.7a5.2 5.2 0 0 1-4.2-2.1l-2.7-3.6a1.6 1.6 0 0 1 2.4-2l1.9 1.8"/>'
  };

  function icon(name, extra) {
    return '<svg class="ic' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  /* ===================== Hilfsfunktionen ===================== */

  function pad(n) { return String(n).padStart(2, '0'); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function byId(id) { return TABLES.find(function (t) { return t.id === id; }); }

  function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function fmtShort(iso) {
    const d = fromISO(iso);
    return DAYS_SHORT[d.getDay()] + ' ' + d.getDate() + '. ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtLong(iso) {
    const d = fromISO(iso);
    return DAYS[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function slotIdx(time) { return SLOTS.indexOf(time || state.time); }
  function slotMinutes(i) { return 17 * 60 + i * 30; }
  function isPast(iso, i) {
    const t = toISO(today());
    if (iso !== t) return iso < t;
    const n = new Date();
    return slotMinutes(i) < n.getHours() * 60 + n.getMinutes() + 30;
  }
  function guestsLabel(g) { return g === 1 ? '1 Person' : g + ' Personen'; }
  function rangeLabel(t) { return t.min + '–' + t.max + ' Personen'; }

  /* ===================== Belegung ===================== */

  // Erfundene, aber stabile Belegung: gleicher Tag + Tisch ergibt immer dieselben Buchungen.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const busyCache = new Map();
  function demoBookings(iso, t) {
    const key = iso + '|' + t.id;
    if (busyCache.has(key)) return busyCache.get(key);
    const wd = fromISO(iso).getDay();
    const p = wd === 6 ? 0.36 : wd === 5 ? 0.32 : wd === 0 ? 0.28 : 0.22;
    const rand = rng(hash(key));
    const set = new Set();
    let i = Math.floor(rand() * 5);
    while (i < SLOTS.length) {
      if (rand() < p) {
        const len = 3 + Math.floor(rand() * 2);
        for (let k = i; k < Math.min(i + len, SLOTS.length); k++) set.add(k);
        i += len + Math.floor(rand() * 2);
      } else {
        i += 2 + Math.floor(rand() * 2);
      }
    }
    busyCache.set(key, set);
    return set;
  }
  function ownAt(iso, id, i) {
    return state.reservations.some(function (r) {
      return r.date === iso && r.table === id && Math.abs(slotIdx(r.time) - i) < STAY;
    });
  }
  function isFree(t, iso, i) {
    iso = iso || state.date;
    if (i === undefined) i = slotIdx();
    return !demoBookings(iso, t).has(i) && !ownAt(iso, t.id, i);
  }
  function fits(t, g) { g = g || state.guests; return g >= t.min && g <= t.max; }
  function freeCount(iso, i, g) {
    return TABLES.filter(function (t) { return fits(t, g) && isFree(t, iso, i); }).length;
  }
  function slotOk(iso, i, g) { return !isPast(iso, i) && freeCount(iso, i, g || state.guests) > 0; }
  function nearestSlot(iso, from, g) {
    for (let d = 0; d < SLOTS.length; d++) {
      const cands = [from + d, from - d];
      for (let c = 0; c < cands.length; c++) {
        const i = cands[c];
        if (i >= 0 && i < SLOTS.length && slotOk(iso, i, g)) return i;
      }
    }
    return -1;
  }

  /* ===================== Zustand ===================== */

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        reservations: state.reservations,
        favorite: state.favorite,
        contact: state.contact
      }));
    } catch (e) { /* Speicher nicht verfügbar: Demo läuft ohne Persistenz weiter */ }
  }

  const stored = readStore();
  const state = {
    date: '',
    time: '19:00',
    guests: 2,
    selected: null,
    view: 'plan',
    favorite: stored.favorite === true,
    reservations: (Array.isArray(stored.reservations) ? stored.reservations : []).filter(function (r) {
      return r && byId(r.table) && SLOTS.indexOf(r.time) >= 0 && /^\d{4}-\d\d-\d\d$/.test(r.date);
    }),
    contact: Object.assign({ name: '', phone: '', email: '' }, stored.contact || {}),
    occasion: 'none',
    notes: ''
  };

  function initialDate() {
    const t0 = today();
    let d = addDays(t0, (6 - t0.getDay() + 7) % 7); // nächster Samstag
    if (SLOTS.every(function (_, i) { return isPast(toISO(d), i); })) d = addDays(d, 7);
    return toISO(d);
  }
  function initTime() {
    if (!slotOk(state.date, slotIdx())) {
      const i = nearestSlot(state.date, slotIdx('19:00'), state.guests);
      if (i >= 0) state.time = SLOTS[i];
    }
  }
  function initSelection() {
    state.selected = null;
    for (let k = 0; k < PREFERRED.length; k++) {
      const t = byId(PREFERRED[k]);
      if (fits(t) && isFree(t)) { state.selected = t.id; return; }
    }
  }
  function startState() {
    state.guests = 2;
    state.time = '19:00';
    state.date = initialDate();
    initTime();
    initSelection();
  }

  /* ===================== Grundriss (SVG) ===================== */

  function chairsOf(t) {
    const out = [];
    if (t.shape === 'round') {
      const dist = t.r + CH_D / 2 - CH_IN;
      for (let k = 0; k < t.seats; k++) {
        const a = -90 + (360 / t.seats) * k;
        const rad = a * Math.PI / 180;
        out.push({ cx: t.x + Math.cos(rad) * dist, cy: t.y + Math.sin(rad) * dist, w: 24, h: CH_D, rot: a + 90 });
      }
      return out;
    }
    const hw = t.w / 2, hh = t.h / 2, c = t.chairs;
    const along = function (len, n) { return n === 1 ? Math.min(26, len * 0.55) : Math.min(22, len / n - 8); };
    const top = c.top || 0, bottom = c.bottom || 0, left = c.left || 0, right = c.right || 0;
    for (let k = 0; k < top; k++) out.push({ cx: t.x - hw + (t.w / top) * (k + 0.5), cy: t.y - hh - CH_D / 2 + CH_IN, w: along(t.w, top), h: CH_D, rot: 0 });
    for (let k = 0; k < bottom; k++) out.push({ cx: t.x - hw + (t.w / bottom) * (k + 0.5), cy: t.y + hh + CH_D / 2 - CH_IN, w: along(t.w, bottom), h: CH_D, rot: 0 });
    for (let k = 0; k < left; k++) out.push({ cx: t.x - hw - CH_D / 2 + CH_IN, cy: t.y - hh + (t.h / left) * (k + 0.5), w: CH_D, h: along(t.h, left), rot: 0 });
    for (let k = 0; k < right; k++) out.push({ cx: t.x + hw + CH_D / 2 - CH_IN, cy: t.y - hh + (t.h / right) * (k + 0.5), w: CH_D, h: along(t.h, right), rot: 0 });
    return out;
  }

  function chairSVG(ch) {
    const rot = ch.rot ? ' transform="rotate(' + r1(ch.rot) + ' ' + r1(ch.cx) + ' ' + r1(ch.cy) + ')"' : '';
    return '<rect class="chair" x="' + r1(ch.cx - ch.w / 2) + '" y="' + r1(ch.cy - ch.h / 2) + '" width="' + r1(ch.w) + '" height="' + r1(ch.h) + '" rx="4.5"' + rot + '/>';
  }

  function topSVG(t) {
    return t.shape === 'round'
      ? '<circle class="top" cx="' + t.x + '" cy="' + t.y + '" r="' + t.r + '"/>'
      : '<rect class="top" x="' + (t.x - t.w / 2) + '" y="' + (t.y - t.h / 2) + '" width="' + t.w + '" height="' + t.h + '" rx="5"/>';
  }

  function numSVG(t) {
    return '<text class="num" x="' + t.x + '" y="' + t.y + '" dy=".35em">' + t.id + '</text>';
  }

  function bboxOf(t) {
    if (t.shape === 'round') {
      const e = t.r + CH_D - CH_IN;
      return { x1: t.x - e, y1: t.y - e, x2: t.x + e, y2: t.y + e };
    }
    const b = { x1: t.x - t.w / 2, y1: t.y - t.h / 2, x2: t.x + t.w / 2, y2: t.y + t.h / 2 };
    chairsOf(t).forEach(function (ch) {
      b.x1 = Math.min(b.x1, ch.cx - ch.w / 2);
      b.x2 = Math.max(b.x2, ch.cx + ch.w / 2);
      b.y1 = Math.min(b.y1, ch.cy - ch.h / 2);
      b.y2 = Math.max(b.y2, ch.cy + ch.h / 2);
    });
    return b;
  }

  function tableSVG(t) {
    const b = bboxOf(t), p = 7;
    const halo = t.shape === 'round'
      ? '<circle class="halo" cx="' + t.x + '" cy="' + t.y + '" r="' + (t.r + CH_D - CH_IN + p) + '"/>'
      : '<rect class="halo" x="' + r1(b.x1 - p) + '" y="' + r1(b.y1 - p) + '" width="' + r1(b.x2 - b.x1 + 2 * p) + '" height="' + r1(b.y2 - b.y1 + 2 * p) + '" rx="14"/>';
    const bx = t.shape === 'round' ? t.x + t.r * 0.72 : t.x + t.w / 2 - 2;
    const by = t.shape === 'round' ? t.y - t.r * 0.72 : t.y - t.h / 2 + 2;
    return '<g class="tbl" data-id="' + t.id + '" tabindex="0" role="button">' +
      halo + chairsOf(t).map(chairSVG).join('') + topSVG(t) + numSVG(t) +
      '<g class="badge" transform="translate(' + r1(bx) + ' ' + r1(by) + ')"><circle r="9"/><path d="M-4 .2l2.8 2.8 5.2-5.4"/></g>' +
      '<rect class="hit" x="' + r1(b.x1 - 4) + '" y="' + r1(b.y1 - 4) + '" width="' + r1(b.x2 - b.x1 + 8) + '" height="' + r1(b.y2 - b.y1 + 8) + '"/>' +
      '</g>';
  }

  // Detailansicht eines Tisches, immer im selben Maßstab
  function thumbSVG(t) {
    const W = 150, H = 128;
    return '<svg class="thumb" viewBox="' + (t.x - W / 2) + ' ' + (t.y - H / 2) + ' ' + W + ' ' + H + '" aria-hidden="true">' +
      chairsOf(t).map(chairSVG).join('') + topSVG(t) + numSVG(t) + '</svg>';
  }

  /* --- Ausstattung --- */

  const C = {
    floor: '#F7F5F0',
    wall: '#3A3F3B',
    win: '#FDFDFB',
    winLine: '#8F9591',
    furn: '#ECEAE4',
    furnLine: '#A2A39D',
    door: '#5F6561',
    arc: '#A5AAA6'
  };

  function plant(x, y, s) {
    let g = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    for (let i = 0; i < 8; i++) {
      g += '<ellipse cx="0" cy="-9.5" rx="4.3" ry="9.5" transform="rotate(' + (i * 45 + 22) + ')" fill="' + (i % 2 ? '#A7BEA1' : '#89A784') + '" stroke="#4D694A" stroke-width=".9"/>';
    }
    for (let i = 0; i < 5; i++) {
      g += '<ellipse cx="0" cy="-5.5" rx="2.8" ry="5.8" transform="rotate(' + (i * 72) + ')" fill="#C4D4BE" stroke="#4D694A" stroke-width=".7"/>';
    }
    return g + '<circle r="2.2" fill="#4D694A"/></g>';
  }

  function shrub(x, y, r) {
    const n = 10;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const px = r1(x + Math.cos(a) * r), py = r1(y + Math.sin(a) * r);
      d += i === 0 ? 'M' + px + ' ' + py : 'A' + r1(r * 0.36) + ' ' + r1(r * 0.36) + ' 0 0 1 ' + px + ' ' + py;
    }
    return '<path d="' + d + 'Z" fill="#7F9D7A" stroke="#3F5B3D" stroke-width="1"/>' +
      '<circle cx="' + r1(x - r * 0.22) + '" cy="' + r1(y - r * 0.22) + '" r="' + r1(r * 0.42) + '" fill="#9AB595" opacity=".85"/>' +
      '<circle cx="' + r1(x + r * 0.28) + '" cy="' + r1(y + r * 0.22) + '" r="' + r1(r * 0.28) + '" fill="#6C8A67" opacity=".7"/>';
  }

  function umbrella(x, y, r) {
    const pts = [];
    let spokes = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 + 22.5) * Math.PI / 180;
      const px = r1(x + Math.cos(a) * r), py = r1(y + Math.sin(a) * r);
      pts.push(px + ',' + py);
      spokes += 'M' + x + ' ' + y + 'L' + px + ' ' + py;
    }
    return '<polygon points="' + pts.join(' ') + '" fill="#FFFFFF" fill-opacity=".9" stroke="#8C908D" stroke-width="1.3"/>' +
      '<path d="' + spokes + '" stroke="#A8ACA9" stroke-width=".9"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#6E726F"/>';
  }

  function winH(x1, x2, y) {
    return '<rect x="' + x1 + '" y="' + (y - 6) + '" width="' + (x2 - x1) + '" height="12" fill="' + C.win + '" stroke="' + C.winLine + '" stroke-width="1"/>' +
      '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="' + C.winLine + '" stroke-width="1"/>';
  }
  function winV(y1, y2, x) {
    return '<rect x="' + (x - 6) + '" y="' + y1 + '" width="12" height="' + (y2 - y1) + '" fill="' + C.win + '" stroke="' + C.winLine + '" stroke-width="1"/>' +
      '<path d="M' + x + ' ' + y1 + 'V' + y2 + '" stroke="' + C.winLine + '" stroke-width="1"/>';
  }
  function gapH(x1, x2, y) { return '<rect x="' + x1 + '" y="' + (y - 7) + '" width="' + (x2 - x1) + '" height="14" fill="' + C.floor + '"/>'; }
  function gapV(y1, y2, x) { return '<rect x="' + (x - 7) + '" y="' + y1 + '" width="14" height="' + (y2 - y1) + '" fill="' + C.floor + '"/>'; }

  // Tür: Angel (h), offenes Türblatt (o), geschlossene Position (c)
  function door(hx, hy, ox, oy, cx, cy) {
    const r = Math.hypot(ox - hx, oy - hy);
    const sweep = (ox - hx) * (cy - hy) - (oy - hy) * (cx - hx) > 0 ? 1 : 0;
    return '<path d="M' + hx + ' ' + hy + 'L' + ox + ' ' + oy + '" stroke="' + C.door + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M' + ox + ' ' + oy + 'A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + cx + ' ' + cy + '" fill="none" stroke="' + C.arc + '" stroke-width="1"/>';
  }

  function wcIcon(x, y) {
    return '<g fill="#2F3431">' +
      '<circle cx="' + (x - 8) + '" cy="' + (y - 13) + '" r="3.4"/>' +
      '<rect x="' + (x - 12.5) + '" y="' + (y - 8) + '" width="9" height="11" rx="2"/>' +
      '<rect x="' + (x - 11.6) + '" y="' + (y + 2) + '" width="3" height="10" rx="1"/>' +
      '<rect x="' + (x - 7.4) + '" y="' + (y + 2) + '" width="3" height="10" rx="1"/>' +
      '<circle cx="' + (x + 8) + '" cy="' + (y - 13) + '" r="3.4"/>' +
      '<path d="M' + (x + 8) + ' ' + (y - 8.5) + 'l6 13h-12z"/>' +
      '<rect x="' + (x + 4.8) + '" y="' + (y + 3) + '" width="2.6" height="9" rx="1"/>' +
      '<rect x="' + (x + 8.6) + '" y="' + (y + 3) + '" width="2.6" height="9" rx="1"/>' +
      '</g>';
  }

  function zoneLabel(x, y, w, text) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="17" fill="#284A3C"/>' +
      '<text class="zone" x="' + (x + w / 2) + '" y="' + (y + 17) + '" dy=".35em" text-anchor="middle">' + text + '</text>';
  }

  function buildPlan() {
    const s = [];
    s.push('<defs><pattern id="tiles" x="642" y="360" width="34" height="34" patternUnits="userSpaceOnUse">' +
      '<rect width="34" height="34" fill="#EFEEE8"/><path d="M34 0H0V34" fill="none" stroke="#E0DED6" stroke-width="1"/></pattern></defs>');
    s.push('<g class="deco" pointer-events="none">');

    // Terrasse
    s.push('<rect x="642" y="360" width="204" height="660" fill="url(#tiles)"/>');
    s.push('<path d="M642.5 360V1020M647.5 360V1020M642 360.5H846M642 1019.5H846" fill="none" stroke="#B3B6B1" stroke-width="1.2"/>');
    s.push('<rect x="808" y="374" width="32" height="636" rx="5" fill="#E5E9DE" stroke="#BAC1B4" stroke-width="1.2"/>');
    for (let y = 394, k = 0; y <= 992; y += 33, k++) s.push(k % 3 === 1 ? shrub(824, y, 14) : plant(824, y, 0.72));
    s.push(plant(661, 404, 0.75), plant(662, 562, 0.75), plant(660, 866, 0.75), plant(662, 1000, 0.7));
    s.push(umbrella(805, 578, 44), umbrella(805, 862, 44));

    // Innenraum
    s.push('<rect x="100" y="352" width="530" height="670" fill="' + C.floor + '"/>');
    s.push('<rect x="112" y="923" width="153" height="87" fill="#EEECE6"/>');

    // Weinregal neben der Nische
    s.push('<rect x="202" y="512" width="30" height="150" rx="3" fill="' + C.furn + '" stroke="' + C.furnLine + '" stroke-width="1.2"/>');
    for (let y = 524; y <= 650; y += 12) {
      s.push('<circle cx="210.5" cy="' + y + '" r="3.4" fill="#D9D6CE" stroke="' + C.furnLine + '" stroke-width=".8"/>' +
        '<circle cx="223.5" cy="' + y + '" r="3.4" fill="#D9D6CE" stroke="' + C.furnLine + '" stroke-width=".8"/>');
    }

    // Bar mit Hockern
    s.push('<path d="M118 712H158V880H220V908H118Z" fill="#E4E2DB" stroke="#9B9C96" stroke-width="1.2" stroke-linejoin="round"/>');
    s.push('<text class="plan-tag" x="138" y="796" dy=".35em" text-anchor="middle" transform="rotate(-90 138 796)">BAR</text>');
    [740, 778, 816, 854].forEach(function (y) {
      s.push('<circle cx="181" cy="' + y + '" r="10" fill="#D2D1CC" stroke="#8E8F8A" stroke-width="1.2"/>');
    });

    // WC und Empfang
    s.push(wcIcon(146, 968));
    s.push('<text class="plan-tag" x="205" y="966" dy=".35em" text-anchor="middle">WC</text>');
    s.push('<rect x="464" y="962" width="142" height="44" rx="3" fill="' + C.furn + '" stroke="' + C.furnLine + '" stroke-width="1.2"/>');
    s.push('<text class="plan-tag" x="535" y="984" dy=".35em" text-anchor="middle">EMPFANG</text>');

    // Pflanzen innen
    s.push(plant(134, 386, 0.85), plant(594, 386, 0.85), plant(214, 678, 0.7), plant(593, 556, 0.8), plant(312, 984, 0.8));

    // Wände
    s.push('<path d="M106 358H624V1016H106Z" fill="none" stroke="' + C.wall + '" stroke-width="12"/>');
    s.push('<path d="M196 498V690H112M112 920H226M262 920H268V1010" fill="none" stroke="' + C.wall + '" stroke-width="7"/>');

    // Fenster
    [[130, 225], [370, 425], [475, 600]].forEach(function (w) { s.push(winH(w[0], w[1], 358)); });
    [[130, 240], [470, 600]].forEach(function (w) { s.push(winH(w[0], w[1], 1016)); });
    [[395, 455], [745, 840]].forEach(function (w) { s.push(winV(w[0], w[1], 106)); });
    [[425, 520], [660, 750], [870, 955]].forEach(function (w) { s.push(winV(w[0], w[1], 624)); });

    // Türen
    s.push(gapH(360, 436, 1016), door(360, 1016, 360, 978, 398, 1016), door(436, 1016, 436, 978, 398, 1016));
    s.push(gapV(600, 640, 624), door(624, 640, 584, 640, 624, 600));
    s.push(gapV(795, 840, 624), door(624, 795, 584, 795, 624, 840));
    s.push(door(262, 920, 262, 956, 226, 920));

    // Bereichsschilder
    s.push(zoneLabel(165, 386, 118, 'Innen'), zoneLabel(680, 386, 118, 'Terrasse'));
    s.push('</g>');

    s.push('<g class="tables">' + TABLES.map(tableSVG).join('') + '</g>');
    el.plan.innerHTML = s.join('');
  }

  /* ===================== DOM ===================== */

  $$('[data-icon]').forEach(function (node) { node.outerHTML = icon(node.dataset.icon, node.className); });

  const el = {
    slot: $('#device-slot'),
    plan: $('#plan'),
    vDate: $('#v-date'),
    vGuests: $('#v-guests'),
    vTime: $('#v-time'),
    pickThumb: $('#pick-thumb'),
    pickTitle: $('#pick-title'),
    pickLine: $('#pick-line'),
    pickTags: $('#pick-tags'),
    slots: $('#slots'),
    slotsMore: $('#slots-more'),
    ctaPick: $('#cta-pick'),
    viewPlan: $('#view-plan'),
    viewDetails: $('#view-details'),
    viewDone: $('#view-done'),
    back: $('#btn-back'),
    fav: $('#btn-fav'),
    menuBtn: $('#btn-menu'),
    menu: $('#menu'),
    menuCount: $('#menu-count'),
    overlay: $('#overlay'),
    modal: $('#modal'),
    modalTitle: $('#modal-title'),
    modalBody: $('#modal-body'),
    toast: $('#toast')
  };

  /* ===================== Darstellung ===================== */

  function renderFilters() {
    el.vDate.textContent = fmtShort(state.date);
    el.vGuests.textContent = guestsLabel(state.guests);
    el.vTime.textContent = state.time;
  }

  function renderPlan() {
    const i = slotIdx();
    $$('.tbl', el.plan).forEach(function (g) {
      const t = byId(Number(g.dataset.id));
      const sel = state.selected === t.id;
      const free = isFree(t, state.date, i);
      const fit = fits(t);
      g.classList.toggle('is-selected', sel);
      g.classList.toggle('is-busy', !sel && !free);
      g.classList.toggle('is-unfit', !sel && !fit);
      g.classList.toggle('is-free', !sel && free && fit);
      g.setAttribute('aria-pressed', String(sel));
      g.setAttribute('aria-disabled', String(!sel && !(free && fit)));
      const status = sel ? 'ausgewählt' : !free ? 'belegt' : !fit ? 'passt nicht für ' + guestsLabel(state.guests) : 'frei';
      g.setAttribute('aria-label', 'Tisch ' + t.id + ', ' + rangeLabel(t) + ', ' + AREAS[t.area].label + ', ' + status);
    });
  }

  function renderPick() {
    const t = state.selected ? byId(state.selected) : null;
    if (!t) {
      const n = freeCount(state.date, slotIdx(), state.guests);
      el.pickThumb.innerHTML = '<span class="thumb-empty">' + icon('tap') + '</span>';
      el.pickTitle.textContent = 'Tisch wählen';
      el.pickLine.innerHTML = icon('users') + '<span>' + (n
        ? n + (n === 1 ? ' Tisch' : ' Tische') + ' frei für ' + guestsLabel(state.guests)
        : 'Um ' + state.time + ' Uhr ist kein Tisch frei') + '</span>';
      el.pickTags.innerHTML = '<span class="hint">' + (n
        ? 'Tippen Sie im Plan auf einen hellgrünen Tisch.'
        : 'Wählen Sie unten eine andere Uhrzeit.') + '</span>';
      return;
    }
    const f = t.feature ? FEATURES[t.feature] : null;
    el.pickThumb.innerHTML = thumbSVG(t);
    el.pickTitle.textContent = 'Tisch ' + t.id;
    el.pickLine.innerHTML = icon('users') + '<span>' + rangeLabel(t) + '</span>';
    el.pickTags.innerHTML = '<span class="tag">' + icon(AREAS[t.area].icon) + AREAS[t.area].label + '</span>' +
      (f ? '<span class="tag' + (f.icon === 'star' ? ' is-star' : '') + '">' + icon(f.icon) + f.label + '</span>' : '');
  }

  let lastCentered = '';
  function renderSlots() {
    el.slots.innerHTML = SLOTS.map(function (s, i) {
      const on = s === state.time;
      const ok = slotOk(state.date, i);
      const why = ok ? '' : isPast(state.date, i) ? 'Uhrzeit vorbei' : 'Kein passender Tisch frei';
      return '<button type="button" class="slot" data-time="' + s + '" aria-pressed="' + on + '"' +
        (!ok && !on ? ' disabled' : '') + (why ? ' title="' + why + '"' : '') + '>' + s + '</button>';
    }).join('');
    const key = state.date + ' ' + state.time;
    if (key !== lastCentered) {
      centerSlot(lastCentered !== '');
      lastCentered = key;
    }
    updateSlotsMore();
  }

  function centerSlot(smooth) {
    const b = el.slots.querySelector('[aria-pressed="true"]');
    if (!b) return;
    const left = b.offsetLeft - (el.slots.clientWidth - b.offsetWidth) / 2;
    el.slots.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
  }

  function updateSlotsMore() {
    const s = el.slots;
    const atEnd = s.scrollLeft + s.clientWidth >= s.scrollWidth - 4;
    el.slotsMore.classList.toggle('at-end', atEnd);
    el.slotsMore.setAttribute('aria-label', atEnd ? 'Frühere Uhrzeiten' : 'Spätere Uhrzeiten');
  }

  function upcoming() {
    return state.reservations.filter(function (r) { return !isPast(r.date, slotIdx(r.time)); });
  }

  function renderHeader() {
    el.fav.setAttribute('aria-pressed', String(state.favorite));
    el.fav.setAttribute('aria-label', state.favorite ? 'Aus Favoriten entfernen' : 'Als Favorit merken');
    const n = upcoming().length;
    el.menuCount.textContent = n ? String(n) : '';
  }

  function render() {
    renderFilters();
    renderPlan();
    renderPick();
    renderSlots();
    el.ctaPick.disabled = !state.selected;
    renderHeader();
  }

  /* ===================== Hinweise ===================== */

  let toastTimer = 0;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 3000);
  }

  /* ===================== Auswahl & Filter ===================== */

  function activateTable(id) {
    const t = byId(id);
    if (!t || state.selected === id) return;
    if (ownAt(state.date, id, slotIdx())) { toast('Diesen Tisch haben Sie an diesem Abend schon reserviert.'); return; }
    if (!isFree(t)) { toast('Tisch ' + id + ' ist um ' + state.time + ' Uhr belegt.'); return; }
    if (!fits(t)) { toast('Tisch ' + id + ' ist für ' + rangeLabel(t) + ' gedacht.'); return; }
    state.selected = id;
    render();
  }

  // Prüft, ob der gewählte Tisch nach einer Änderung noch passt.
  function checkSelection() {
    if (!state.selected) return '';
    const t = byId(state.selected);
    let msg = '';
    if (!fits(t)) msg = 'Tisch ' + t.id + ' ist für ' + rangeLabel(t) + ' gedacht.';
    else if (!isFree(t)) msg = 'Tisch ' + t.id + ' ist um ' + state.time + ' Uhr belegt.';
    if (msg) state.selected = null;
    return msg ? msg + ' Bitte wählen Sie einen anderen Tisch.' : '';
  }

  // Wenn zur gewählten Uhrzeit nichts frei ist, auf die nächste freie Uhrzeit ausweichen.
  function adjustTime() {
    if (slotOk(state.date, slotIdx())) return '';
    const i = nearestSlot(state.date, slotIdx(), state.guests);
    if (i < 0 || SLOTS[i] === state.time) return '';
    const old = state.time;
    state.time = SLOTS[i];
    return 'Um ' + old + ' Uhr ist nichts frei, daher ' + state.time + ' Uhr.';
  }

  function applyChange(notes) {
    const msg = notes.filter(Boolean).join(' ');
    render();
    if (msg) toast(msg);
  }

  function setTime(time) {
    state.time = time;
    applyChange([checkSelection()]);
  }
  function setDate(iso) {
    state.date = iso;
    applyChange([adjustTime(), checkSelection()]);
  }
  function setGuests(g) {
    state.guests = g;
    applyChange([adjustTime(), checkSelection()]);
  }

  /* ===================== Bottom-Sheets ===================== */

  let modalReturn = null;
  function openModal(title, html, mount) {
    closeMenu();
    el.toast.classList.remove('show');
    modalReturn = document.activeElement;
    el.modalTitle.textContent = title;
    el.modalBody.onclick = null;
    el.modalBody.innerHTML = html;
    el.overlay.hidden = false;
    if (mount) mount(el.modalBody);
    const first = el.modalBody.querySelector('[aria-pressed="true"]:not(:disabled)') || el.modal;
    first.focus({ preventScroll: true });
  }
  function closeModal() {
    if (el.overlay.hidden) return;
    el.overlay.hidden = true;
    el.modalBody.innerHTML = '';
    if (modalReturn && document.contains(modalReturn)) modalReturn.focus({ preventScroll: true });
    modalReturn = null;
  }

  let calMonth = null;
  function calendarHTML() {
    const y = calMonth.getFullYear(), mo = calMonth.getMonth();
    const t0 = today(), last = addDays(t0, BOOK_AHEAD);
    const days = new Date(y, mo + 1, 0).getDate();
    const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
    const prevOk = new Date(y, mo, 0) >= t0;
    const nextOk = new Date(y, mo + 1, 1) <= last;
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, mo, d), iso = toISO(date);
      const out = date < t0 || date > last;
      const closed = date.getDay() === CLOSED_DAY;
      const full = !out && !closed && SLOTS.every(function (_, i) { return !slotOk(iso, i, state.guests); });
      const on = iso === state.date;
      const note = closed ? ', Ruhetag' : full ? ', ausgebucht' : '';
      cells += '<button type="button" class="day' + (on ? ' is-on' : '') + (iso === toISO(t0) ? ' is-today' : '') +
        (closed && !out ? ' is-closed' : '') + '" data-date="' + iso + '" aria-pressed="' + on + '" aria-label="' +
        fmtLong(iso) + note + '"' + (out || closed || full ? ' disabled' : '') + '>' + d + '</button>';
    }
    return '<div class="cal-head">' +
      '<button class="icon-btn" type="button" data-cal="-1" aria-label="Vorheriger Monat"' + (prevOk ? '' : ' disabled') + '>' + icon('chevLeft') + '</button>' +
      '<div class="cal-month" aria-live="polite">' + MONTHS[mo] + ' ' + y + '</div>' +
      '<button class="icon-btn" type="button" data-cal="1" aria-label="Nächster Monat"' + (nextOk ? '' : ' disabled') + '>' + icon('chevRight') + '</button>' +
      '</div>' +
      '<div class="cal-grid cal-wd" aria-hidden="true"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>' +
      '<div class="cal-grid">' + cells + '</div>' +
      '<p class="modal-note">Montag ist Ruhetag. Reservierungen sind bis ' + BOOK_AHEAD + ' Tage im Voraus möglich.</p>';
  }

  function openDate() {
    const d = fromISO(state.date);
    calMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    openModal('Datum wählen', calendarHTML(), function (body) {
      body.onclick = function (e) {
        const nav = e.target.closest('[data-cal]');
        if (nav) {
          const dir = nav.dataset.cal;
          calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + Number(dir), 1);
          body.innerHTML = calendarHTML();
          const again = body.querySelector('[data-cal="' + dir + '"]:not(:disabled)');
          (again || el.modal).focus();
          return;
        }
        const day = e.target.closest('[data-date]');
        if (day && !day.disabled) { closeModal(); setDate(day.dataset.date); }
      };
    });
  }

  function openGuests() {
    let html = '<div class="guest-grid">';
    for (let g = 1; g <= MAX_GUESTS; g++) {
      const on = g === state.guests;
      html += '<button type="button" class="guest' + (on ? ' is-on' : '') + '" data-guests="' + g + '" aria-pressed="' + on + '">' +
        '<span class="guest-n">' + g + '</span><span class="guest-l">' + (g === 1 ? 'Person' : 'Personen') + '</span></button>';
    }
    html += '</div><p class="modal-note">Mehr als ' + MAX_GUESTS + ' Personen? Für Gruppen und Feiern kontaktieren Sie das Bistro bitte direkt.</p>';
    openModal('Anzahl Gäste', html, function (body) {
      body.onclick = function (e) {
        const b = e.target.closest('[data-guests]');
        if (b) { closeModal(); setGuests(Number(b.dataset.guests)); }
      };
    });
  }

  function openTime() {
    const groups = [['Früher Abend', 0, 3], ['Abend', 4, 7], ['Später Abend', 8, SLOTS.length - 1]];
    const html = groups.map(function (gr) {
      let cells = '';
      for (let i = gr[1]; i <= gr[2]; i++) {
        const s = SLOTS[i], on = s === state.time, past = isPast(state.date, i);
        const n = past ? 0 : freeCount(state.date, i, state.guests);
        const label = past ? 'vorbei' : n ? n + ' frei' : 'voll';
        cells += '<button type="button" class="time' + (on ? ' is-on' : '') + '" data-time="' + s + '" aria-pressed="' + on + '"' +
          (!on && (past || !n) ? ' disabled' : '') + '><span class="time-t">' + s + '</span><span class="time-n">' + label + '</span></button>';
      }
      return '<div class="time-group"><h3>' + gr[0] + '</h3><div class="time-grid">' + cells + '</div></div>';
    }).join('') + '<p class="modal-note">Freie Tische für ' + guestsLabel(state.guests) + ' am ' + fmtShort(state.date) + '. Ein Tisch ist jeweils für 2 Stunden reserviert.</p>';
    openModal('Uhrzeit wählen', html, function (body) {
      body.onclick = function (e) {
        const b = e.target.closest('[data-time]');
        if (b && !b.disabled) { closeModal(); setTime(b.dataset.time); }
      };
    });
  }

  function reservationsHTML() {
    if (!state.reservations.length) {
      return '<div class="empty">' + icon('calendar') + '<p>Noch keine Reservierungen.</p>' +
        '<p class="muted">Wählen Sie im Plan einen Tisch und tippen Sie auf „Platz auswählen“.</p></div>';
    }
    const list = state.reservations.slice().sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
    return '<ul class="res-list">' + list.map(function (r) {
      const t = byId(r.table), past = isPast(r.date, slotIdx(r.time));
      return '<li class="res' + (past ? ' is-past' : '') + '" data-code="' + esc(r.code) + '">' +
        '<div><p class="res-when">' + fmtShort(r.date) + ' · ' + r.time + ' Uhr</p>' +
        '<p class="res-what">Tisch ' + t.id + ' · ' + AREAS[t.area].label + ' · ' + guestsLabel(r.guests) + '</p>' +
        '<p class="res-code">' + esc(r.code) + ' · ' + esc(r.name) + '</p></div>' +
        (past ? '<span class="res-badge">Vergangen</span>' : '<button type="button" class="btn-small" data-cancel>Stornieren</button>') +
        '<div class="res-confirm"><span>Wirklich stornieren?</span>' +
        '<button type="button" class="btn-small plain" data-keep>Behalten</button>' +
        '<button type="button" class="btn-small danger" data-confirm>Stornieren</button></div>' +
        '</li>';
    }).join('') + '</ul>';
  }

  function openReservations() {
    openModal('Meine Reservierungen', reservationsHTML(), function (body) {
      body.onclick = function (e) {
        const li = e.target.closest('.res');
        if (!li) return;
        if (e.target.closest('[data-cancel]')) {
          li.classList.add('is-confirm');
          li.querySelector('[data-confirm]').focus();
        } else if (e.target.closest('[data-keep]')) {
          li.classList.remove('is-confirm');
          li.querySelector('[data-cancel]').focus();
        } else if (e.target.closest('[data-confirm]')) {
          const code = li.dataset.code;
          state.reservations = state.reservations.filter(function (r) { return r.code !== code; });
          writeStore();
          body.innerHTML = reservationsHTML();
          el.modal.focus();
          render();
          toast('Reservierung ' + code + ' storniert.');
        }
      };
    });
  }

  function openHours() {
    openModal('Öffnungszeiten',
      '<dl class="hours">' +
      '<div><dt>Dienstag bis Sonntag</dt><dd>17:00–23:00 Uhr</dd></div>' +
      '<div><dt>Küche</dt><dd>bis 22:00 Uhr</dd></div>' +
      '<div><dt>Montag</dt><dd>Ruhetag</dd></div>' +
      '</dl>' +
      '<p class="address">Ihr Bistro<br>Musterstraße 12<br>10115 Berlin</p>' +
      '<p class="modal-note">Die letzte Reservierung ist um 22:00 Uhr möglich. Wir halten Ihren Tisch 15 Minuten frei.</p>');
  }

  /* ===================== Menü ===================== */

  function openMenu() {
    el.menu.hidden = false;
    el.menuBtn.setAttribute('aria-expanded', 'true');
    el.menu.querySelector('button').focus({ preventScroll: true });
  }
  function closeMenu() {
    if (el.menu.hidden) return;
    el.menu.hidden = true;
    el.menuBtn.setAttribute('aria-expanded', 'false');
  }

  function resetDemo() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignorieren */ }
    state.reservations = [];
    state.favorite = false;
    state.contact = { name: '', phone: '', email: '' };
    state.occasion = 'none';
    state.notes = '';
    closeModal();
    startState();
    lastCentered = '';
    goView('plan');
    render();
    toast('Demo zurückgesetzt.');
  }

  const ACTIONS = { reservations: openReservations, hours: openHours, reset: resetDemo };

  /* ===================== Ansichten ===================== */

  function goView(v) {
    state.view = v;
    el.viewPlan.hidden = v !== 'plan';
    el.viewDetails.hidden = v !== 'details';
    el.viewDone.hidden = v !== 'done';
    const cur = { plan: el.viewPlan, details: el.viewDetails, done: el.viewDone }[v];
    cur.scrollTop = 0;
    el.back.setAttribute('aria-label', v === 'plan' ? 'Zurück zur Restaurantseite' : 'Zurück zum Tischplan');
    const h = cur.querySelector('.page-title');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  function renderDetails() {
    const t = byId(state.selected), c = state.contact;
    el.viewDetails.innerHTML =
      '<div class="page">' +
        '<div><p class="eyebrow">Schritt 2 von 2</p><h2 class="page-title">Ihre Angaben</h2></div>' +
        '<div class="summary">' +
          '<div class="summary-thumb">' + thumbSVG(t) + '</div>' +
          '<div class="summary-main">' +
            '<p class="summary-table">Tisch ' + t.id + '<span> · ' + AREAS[t.area].label + '</span></p>' +
            '<dl class="summary-list">' +
              '<div><dt>Datum</dt><dd>' + fmtLong(state.date) + '</dd></div>' +
              '<div><dt>Uhrzeit</dt><dd>' + state.time + ' Uhr</dd></div>' +
              '<div><dt>Gäste</dt><dd>' + guestsLabel(state.guests) + '</dd></div>' +
            '</dl>' +
          '</div>' +
          '<button type="button" class="link-btn" data-action="edit">Ändern</button>' +
        '</div>' +
        '<form class="form" id="booking-form" novalidate>' +
          '<div class="field" data-field="name">' +
            '<label for="f-name">Name</label>' +
            '<input class="input" id="f-name" autocomplete="name" placeholder="z. B. Anna Schneider" aria-describedby="e-name" value="' + esc(c.name) + '">' +
            '<p class="field-error" id="e-name"></p>' +
          '</div>' +
          '<div class="field" data-field="phone">' +
            '<label for="f-phone">Telefon</label>' +
            '<input class="input" id="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="z. B. 0151 2345678" aria-describedby="e-phone" value="' + esc(c.phone) + '">' +
            '<p class="field-error" id="e-phone"></p>' +
          '</div>' +
          '<div class="field" data-field="email">' +
            '<label for="f-email">E-Mail <span class="opt">(optional)</span></label>' +
            '<input class="input" id="f-email" type="email" inputmode="email" autocomplete="email" placeholder="anna@beispiel.de" aria-describedby="e-email" value="' + esc(c.email) + '">' +
            '<p class="field-error" id="e-email"></p>' +
          '</div>' +
          '<fieldset class="field">' +
            '<legend>Anlass</legend>' +
            '<div class="chips">' + OCCASIONS.map(function (o) {
              return '<label class="chip"><input type="radio" name="occasion" id="o-' + o[0] + '" value="' + o[0] + '"' +
                (state.occasion === o[0] ? ' checked' : '') + '><span>' + o[1] + '</span></label>';
            }).join('') + '</div>' +
          '</fieldset>' +
          '<div class="field">' +
            '<label for="f-notes">Wünsche <span class="opt">(optional)</span></label>' +
            '<textarea class="input" id="f-notes" rows="2" placeholder="Allergien, Kinderstuhl, Hund …">' + esc(state.notes) + '</textarea>' +
          '</div>' +
          '<p class="fineprint">Kostenlos stornierbar bis 24 Stunden vorher. Wir halten Ihren Tisch 15 Minuten nach der vereinbarten Uhrzeit frei.</p>' +
        '</form>' +
      '</div>' +
      '<div class="cta-bar on-bg">' +
        '<button class="cta" type="submit" form="booking-form"><span>Reservieren</span>' + icon('arrow') + '</button>' +
      '</div>';

    const form = $('#booking-form');
    form.addEventListener('input', function (e) {
      const id = e.target.id;
      if (id === 'f-name') state.contact.name = e.target.value;
      else if (id === 'f-phone') state.contact.phone = e.target.value;
      else if (id === 'f-email') state.contact.email = e.target.value;
      else if (id === 'f-notes') state.notes = e.target.value;
      else if (e.target.name === 'occasion') state.occasion = e.target.value;
      const field = e.target.closest('[data-field]');
      if (field && field.classList.contains('has-error')) {
        field.classList.remove('has-error');
        field.querySelector('.field-error').textContent = '';
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); submitBooking(); });
    $('[data-action="edit"]', el.viewDetails).addEventListener('click', function () { goView('plan'); });
  }

  function makeCode() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = 'IB-';
      for (let i = 0; i < 4; i++) code += A[Math.floor(Math.random() * A.length)];
    } while (state.reservations.some(function (r) { return r.code === code; }));
    return code;
  }

  function submitBooking() {
    const name = $('#f-name').value.trim();
    const phone = $('#f-phone').value.trim();
    const email = $('#f-email').value.trim();
    const errs = {};
    if (name.length < 2) errs.name = 'Bitte geben Sie Ihren Namen ein.';
    if (!phone) errs.phone = 'Bitte geben Sie eine Telefonnummer für Rückfragen ein.';
    else if (phone.replace(/\D/g, '').length < 6 || /[^\d\s+()\/-]/.test(phone)) errs.phone = 'Diese Telefonnummer ist unvollständig, z. B. 0151 2345678.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = 'Bitte prüfen Sie die E-Mail-Adresse, z. B. anna@beispiel.de.';

    ['name', 'phone', 'email'].forEach(function (k) {
      $('[data-field="' + k + '"]', el.viewDetails).classList.toggle('has-error', !!errs[k]);
      $('#e-' + k).textContent = errs[k] || '';
      $('#f-' + k).setAttribute('aria-invalid', errs[k] ? 'true' : 'false');
    });
    const firstErr = Object.keys(errs)[0];
    if (firstErr) { $('#f-' + firstErr).focus(); return; }

    const t = byId(state.selected);
    if (!t || !isFree(t) || !fits(t)) {
      state.selected = null;
      goView('plan');
      render();
      toast('Dieser Tisch ist inzwischen belegt. Bitte wählen Sie einen anderen.');
      return;
    }
    const res = {
      code: makeCode(),
      table: t.id,
      date: state.date,
      time: state.time,
      guests: state.guests,
      name: name,
      phone: phone,
      email: email,
      occasion: state.occasion,
      notes: state.notes.trim(),
      created: new Date().toISOString()
    };
    state.reservations.push(res);
    state.contact = { name: name, phone: phone, email: email };
    writeStore();
    renderHeader();
    renderDone(res);
    goView('done');
  }

  function renderDone(r) {
    const t = byId(r.table);
    const occ = OCCASIONS.find(function (o) { return o[0] === r.occasion; });
    const firstName = r.name.split(/\s+/)[0];
    el.viewDone.innerHTML =
      '<div class="page done">' +
        '<div class="done-mark">' + icon('check') + '</div>' +
        '<h2 class="page-title">Ihr Tisch ist reserviert</h2>' +
        '<p class="done-lead">Vielen Dank, ' + esc(firstName) + '. Wir freuen uns auf Ihren Besuch.</p>' +
        '<div class="ticket">' +
          '<div class="ticket-top"><span class="eyebrow">Reservierungsnummer</span><span class="ticket-code">' + esc(r.code) + '</span></div>' +
          '<div class="ticket-cut" aria-hidden="true"></div>' +
          '<dl class="ticket-list">' +
            '<div><dt>Tisch</dt><dd>Tisch ' + t.id + ' · ' + AREAS[t.area].label + '</dd></div>' +
            '<div><dt>Datum</dt><dd>' + fmtLong(r.date) + '</dd></div>' +
            '<div><dt>Uhrzeit</dt><dd>' + r.time + ' Uhr</dd></div>' +
            '<div><dt>Gäste</dt><dd>' + guestsLabel(r.guests) + '</dd></div>' +
            (occ && occ[0] !== 'none' ? '<div><dt>Anlass</dt><dd>' + occ[1] + '</dd></div>' : '') +
            (r.notes ? '<div><dt>Wünsche</dt><dd>' + esc(r.notes) + '</dd></div>' : '') +
          '</dl>' +
        '</div>' +
        '<p class="fineprint">Demo: Es wurde keine echte Reservierung angelegt und keine Nachricht verschickt. Die Buchung ist nur in diesem Browser gespeichert.</p>' +
      '</div>' +
      '<div class="cta-bar on-bg">' +
        '<button class="cta" type="button" data-action="finish"><span>Fertig</span></button>' +
        '<button class="btn-ghost" type="button" data-action="list">Meine Reservierungen</button>' +
      '</div>';
    $('[data-action="finish"]', el.viewDone).addEventListener('click', finish);
    $('[data-action="list"]', el.viewDone).addEventListener('click', openReservations);
  }

  function finish() {
    state.selected = null;
    state.occasion = 'none';
    state.notes = '';
    goView('plan');
    render();
  }

  /* ===================== Gerätedarstellung ===================== */

  const frameMQ = window.matchMedia('(min-width: 600px) and (min-height: 600px)');
  function fitDevice() {
    if (!frameMQ.matches) {
      el.slot.style.removeProperty('--s');
      el.slot.style.removeProperty('--dh');
      return;
    }
    const note = window.innerWidth >= 1040 ? 364 : 0;
    const availH = window.innerHeight - 40;
    const availW = window.innerWidth - 32 - note;
    let s = Math.min(1, availH / FRAME_H, availW / FRAME_W);
    let h = FRAME_H;
    if (s < 0.8) {
      // Sehr flache Fenster: lieber ein kürzeres Gerät als winzige Schrift
      s = Math.min(0.8, availW / FRAME_W);
      h = Math.max(600, Math.min(FRAME_H, availH / s));
    }
    el.slot.style.setProperty('--s', String(r1(s * 100) / 100));
    el.slot.style.setProperty('--dh', Math.round(h) + 'px');
  }

  /* ===================== Ereignisse ===================== */

  el.plan.addEventListener('click', function (e) {
    const g = e.target.closest('.tbl');
    if (g) activateTable(Number(g.dataset.id));
  });
  el.plan.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.tbl');
    if (!g) return;
    e.preventDefault();
    activateTable(Number(g.dataset.id));
  });

  el.slots.addEventListener('click', function (e) {
    const b = e.target.closest('[data-time]');
    if (b && !b.disabled && b.dataset.time !== state.time) setTime(b.dataset.time);
  });
  el.slots.addEventListener('scroll', updateSlotsMore, { passive: true });
  el.slotsMore.addEventListener('click', function () {
    const s = el.slots;
    if (el.slotsMore.classList.contains('at-end')) s.scrollTo({ left: 0, behavior: 'smooth' });
    else s.scrollBy({ left: s.clientWidth * 0.7, behavior: 'smooth' });
  });

  $('#f-date').addEventListener('click', openDate);
  $('#f-guests').addEventListener('click', openGuests);
  $('#f-time').addEventListener('click', openTime);

  el.ctaPick.addEventListener('click', function () {
    if (!state.selected) return;
    renderDetails();
    goView('details');
  });

  el.back.addEventListener('click', function () {
    if (state.view === 'details') goView('plan');
    else if (state.view === 'done') finish();
    else toast('In der echten App ginge es hier zurück zur Restaurantseite.');
  });

  el.fav.addEventListener('click', function () {
    state.favorite = !state.favorite;
    writeStore();
    renderHeader();
    toast(state.favorite ? 'Ihr Bistro ist jetzt in Ihren Favoriten.' : 'Aus den Favoriten entfernt.');
  });

  el.menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (el.menu.hidden) openMenu(); else closeMenu();
  });
  el.menu.addEventListener('click', function (e) {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    closeMenu();
    ACTIONS[b.dataset.action]();
  });
  document.addEventListener('click', function (e) {
    if (!el.menu.hidden && !e.target.closest('#menu')) closeMenu();
  });
  $$('.stage-note [data-action="reset"]').forEach(function (b) { b.addEventListener('click', resetDemo); });

  el.overlay.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeModal();
  });
  el.overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const f = $$('button:not(:disabled), input, textarea, [tabindex="0"]', el.modal).filter(function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === el.modal)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!el.overlay.hidden) closeModal();
    else if (!el.menu.hidden) { closeMenu(); el.menuBtn.focus(); }
  });

  window.addEventListener('resize', fitDevice);

  /* ===================== Start ===================== */

  startState();
  buildPlan();
  fitDevice();
  render();
})();
