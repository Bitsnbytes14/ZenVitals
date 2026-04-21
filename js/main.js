// main.js — ZenVitals app initializer

// ── Chat Module ──────────────────────────────────────────────
const Chat = {
  initialized: false,
  messages: [],

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this._bindInput();
    this._appendMessage('bot', "Hi! I'm your ZenVitals AI companion. Ask me anything about sleep, stress, energy, or your wellness score. 💙");
  },

  _bindInput() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send');
    if (!input || !btn) return;

    const send = () => {
      const msg = input.value.trim();
      if (!msg) return;
      this._appendMessage('user', msg);
      input.value = '';
      setTimeout(() => {
        const latest = Storage.getLatestCheckIn();
        const response = AI.chat(msg, latest);
        this._appendMessage('bot', response);
      }, 600 + Math.random() * 400);
    };

    btn.addEventListener('click', send);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send();
    });

    // Quick prompt chips
    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent;
        send();
      });
    });
  },

  _appendMessage(role, text) {
    const log = document.getElementById('chat-log');
    if (!log) return;

    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    div.innerHTML = `
      <div class="msg-bubble">
        ${role === 'bot' ? '<span class="msg-avatar">🌿</span>' : ''}
        <p>${text}</p>
      </div>
    `;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    this.messages.push({ role, text, time: Date.now() });
  },
};

// ── App Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation (handles all page switching)
  Navigation.init();

  // Seed demo data if no check-ins exist
  if (!Storage.getLatestCheckIn()) {
    _seedDemoData();
  }

  // Wire clear data button
  const clearBtn = document.getElementById('clear-data-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Reset all your wellness data? This cannot be undone.')) {
        Storage.clearAll();
        Dashboard.refresh();
        alert('Data cleared. Start fresh with a new check-in!');
      }
    });
  }

  console.log('%cZenVitals initialized ✓', 'color:#a78bfa;font-weight:bold;font-size:14px');
});

// Seed realistic demo data for first-time users
function _seedDemoData() {
  const moods = ['good', 'okay', 'great', 'good', 'low', 'okay', 'good'];
  const days = ['Apr 14', 'Apr 15', 'Apr 16', 'Apr 17', 'Apr 18', 'Apr 19', 'Apr 20'];

  const samples = [
    { energy: 6, stress: 5, sleepHours: 7, activity: 5, mood: 'good' },
    { energy: 4, stress: 7, sleepHours: 6, activity: 3, mood: 'okay' },
    { energy: 8, stress: 3, sleepHours: 8, activity: 7, mood: 'great' },
    { energy: 7, stress: 4, sleepHours: 7.5, activity: 6, mood: 'good' },
    { energy: 3, stress: 8, sleepHours: 5, activity: 2, mood: 'low' },
    { energy: 5, stress: 6, sleepHours: 6.5, activity: 4, mood: 'okay' },
    { energy: 7, stress: 4, sleepHours: 7, activity: 6, mood: 'good' },
  ];

  samples.forEach((s, i) => {
    const score = Logic.calculateScore(s);
    const categories = Logic.getCategoryScores(s);
    const all = Storage.getCheckIns();
    all.push({
      ...s,
      score,
      categories,
      date: days[i],
      id: Date.now() + i,
      timestamp: new Date().toISOString(),
    });
    Storage.save(Storage.KEYS.CHECKINS, all);
  });
}
