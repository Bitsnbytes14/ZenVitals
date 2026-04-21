// profile.js — ZenVitals User Profile Module

const Profile = {
  KEY: 'zv_user_profile',
  editing: false,

  init() {
    this._bindEdit();
    this._loadProfile();
  },

  _bindEdit() {
    const btn = document.getElementById('edit-profile-btn');
    if (btn) {
      btn.addEventListener('click', () => this._toggleEdit());
    }

    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveProfile());
    }

    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this._cancelEdit());
    }
  },

  _loadProfile() {
    const profile = Storage.load(this.KEY) || this._defaultProfile();
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');

    if (nameEl) nameEl.textContent = profile.name || 'Guest User';
    if (emailEl) emailEl.textContent = profile.email || 'Not set';

    this._loadStats();
    this._setFieldsReadonly(true);
  },

  _loadStats() {
    const latest = Storage.getLatestCheckIn();
    const checkIns = Storage.getCheckIns();
    const scores = checkIns.map(c => c.score).filter(Boolean);

    const totalCheckins = checkIns.length;
    const latestScore = latest?.score || '--';
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '--';
    const bestScore = scores.length ? Math.max(...scores) : '--';

    const el = document.getElementById('stat-total-checkins');
    if (el) el.textContent = totalCheckins;

    const el2 = document.getElementById('stat-latest-score');
    if (el2) el2.textContent = latestScore;

    const el3 = document.getElementById('stat-avg-score');
    if (el3) el3.textContent = avgScore;

    const el4 = document.getElementById('stat-best-score');
    if (el4) el4.textContent = bestScore;
  },

  _toggleEdit() {
    this.editing = !this.editing;
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const inputs = document.querySelectorAll('.profile-input');

    if (this.editing) {
      inputs.forEach(i => (i.readOnly = false));
      if (editBtn) editBtn.style.display = 'none';
      if (saveBtn) saveBtn.style.display = 'inline-block';
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
    }
  },

  _saveProfile() {
    const nameInput = document.getElementById('profile-name-input');
    const emailInput = document.getElementById('profile-email-input');

    if (!nameInput || !emailInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
      nameInput.focus();
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.focus();
      return;
    }

    const profile = {
      name: name || 'Guest User',
      email: email || 'Not set',
      updatedAt: new Date().toISOString()
    };

    Storage.save(this.KEY, profile);
    this.editing = false;
    this._loadProfile();
  },

  _cancelEdit() {
    this._loadProfile();
  },

  _setFieldsReadonly(readonly) {
    const inputs = document.querySelectorAll('.profile-input');
    inputs.forEach(i => (i.readOnly = readonly));

    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (readonly) {
      if (editBtn) editBtn.style.display = 'inline-block';
      if (saveBtn) saveBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
    }
  },

  _defaultProfile() {
    return {
      name: 'Guest User',
      email: 'Not set'
    };
  }
};