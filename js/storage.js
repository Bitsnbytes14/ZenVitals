// storage.js — ZenVitals data layer

const Storage = {
  KEYS: {
    CHECKINS: 'zv_checkins',
    PROFILE: 'zv_profile',
    SETTINGS: 'zv_settings',
  },

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage write error:', e);
      return false;
    }
  },

  load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Storage read error:', e);
      return null;
    }
  },

  // Save a new check-in entry (append)
  saveCheckIn(entry) {
    const all = this.getCheckIns();
    all.push({ ...entry, id: Date.now(), timestamp: new Date().toISOString() });
    return this.save(this.KEYS.CHECKINS, all);
  },

  getCheckIns() {
    return this.load(this.KEYS.CHECKINS) || [];
  },

  getLatestCheckIn() {
    const all = this.getCheckIns();
    return all.length ? all[all.length - 1] : null;
  },

  // Returns last N check-ins
  getRecentCheckIns(n = 7) {
    const all = this.getCheckIns();
    return all.slice(-n);
  },

  clearAll() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  },
};
