// profile.js — ZenVitals User Profile Module

const Profile = {
  KEY: 'zen_profile',

  // ── Read raw profile object from localStorage ────────────────
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : { name: '', email: '', about: '' };
    } catch (e) {
      return { name: '', email: '', about: '' };
    }
  },

  // ── Write profile to localStorage ───────────────────────────
  save(name, email, about) {
    localStorage.setItem(this.KEY, JSON.stringify({ name, email, about }));
  },

  // ── Called by navigation.js each time Profile page is visited ─
  init() {
    this._fill();
    this._stats();
    this._history();
  },

  // ── Populate inputs from saved data ─────────────────────────
  _fill() {
    const p = this.load();
    const get = (id) => document.getElementById(id);

    if (get('profile-name')) get('profile-name').value = p.name || '';
    if (get('profile-email')) get('profile-email').value = p.email || '';
    if (get('profile-bio')) get('profile-bio').value = p.about || '';
    if (get('profile-display-name')) get('profile-display-name').textContent = p.name || 'Wellness User';
  },

  // ── Stats panel (check-ins count, latest score, avg) ─────────
  _stats() {
    const checkIns = AppStorage.getCheckIns();
    const latest = AppStorage.getLatestCheckIn();
    const get = (id) => document.getElementById(id);

    if (get('profile-total-checkins'))
      get('profile-total-checkins').textContent = checkIns.length;

    if (get('profile-latest-score'))
      get('profile-latest-score').textContent = latest ? (latest.score || '--') : '--';

    if (get('profile-avg-score')) {
      if (checkIns.length > 0) {
        const avg = Math.round(checkIns.reduce((s, c) => s + (c.score || 0), 0) / checkIns.length);
        get('profile-avg-score').textContent = avg;
      } else {
        get('profile-avg-score').textContent = '--';
      }
    }
  },

  // ── Recent assessment history rows ───────────────────────────
  _history() {
    const container = document.getElementById('profile-history');
    if (!container) return;

    const checkIns = AppStorage.getCheckIns();
    if (!checkIns.length) {
      container.innerHTML = '<p class="empty-text">No check-ins yet. Complete your first check-in to see your history.</p>';
      return;
    }

    const emoji = { great: '😄', good: '🙂', okay: '😐', low: '😔', awful: '😣' };
    container.innerHTML = [...checkIns].reverse().slice(0, 10).map(c => {
      const lbl = Logic.getScoreLabel(c.score || 0);
      return `<div class="history-row">
        <span class="history-date">${c.date || '—'}</span>
        <span class="history-mood">${emoji[c.mood] || '•'} ${c.mood || ''}</span>
        <span class="history-score" style="color:${lbl.color}">${c.score || '--'}</span>
        <span class="history-label" style="color:${lbl.color}">${lbl.label}</span>
      </div>`;
    }).join('');
  },

  // ── Show inline feedback ─────────────────────────────────────
  _msg(text, ok) {
    const el = document.getElementById('profile-msg');
    if (!el) return;
    el.textContent = text;
    el.style.cssText = `display:block;font-size:0.85rem;padding:0.4rem 0;color:${ok ? '#4ade80' : '#f87171'};`;
    clearTimeout(this._t);
    this._t = setTimeout(() => { el.style.display = 'none'; }, 3500);
  },
};

// ── Bootstrap: runs once when scripts finish loading ────────────
// Binds the Save button directly — no dependency on navigation.js calling Profile.init()
document.addEventListener('DOMContentLoaded', function () {

  // 1. Pre-fill fields if saved data already exists
  Profile._fill();

  // 2. Wire Save button
  const btn = document.getElementById('profile-save-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      const name = (document.getElementById('profile-name')?.value || '').trim();
      const email = (document.getElementById('profile-email')?.value || '').trim();
      const about = (document.getElementById('profile-bio')?.value || '').trim();

      // Validation
      if (!name || !email) {
        Profile._msg('Please enter your name and email.', false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Profile._msg('Please enter a valid email address.', false);
        return;
      }

      // Save to localStorage key: zen_profile
      Profile.save(name, email, about);

      // Update avatar display name immediately
      const d = document.getElementById('profile-display-name');
      if (d) d.textContent = name;

      Profile._msg('✓ Profile saved successfully.', true);
    });
  }
});
