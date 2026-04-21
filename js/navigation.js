// navigation.js — ZenVitals SPA routing

const Navigation = {
  currentPage: 'home',

  init() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTo(el.dataset.nav);
      });
    });

    // Handle mobile nav toggle
    const hamburger = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
      });
      // Close on nav click
      mobileMenu.querySelectorAll('[data-nav]').forEach(el => {
        el.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('active');
        });
      });
    }

    // Start on home
    this.switchTo('home');
  },

  switchTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });

    // Show target
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav active states
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('nav-active', el.dataset.nav === page);
    });

    // Trigger page-specific init
    if (page === 'dashboard') {
      if (Dashboard && Dashboard.refresh) Dashboard.refresh();
    }
    if (page === 'checkin') {
      if (Mood && Mood.init) Mood.init();
    }
    if (page === 'analytics') this._initAnalytics();
    if (page === 'chat') {
      if (Chat && Chat.init) Chat.init();
    }
    if (page === 'booking' && Booking) Booking.init();
    if (page === 'profile' && Profile) Profile.init();
    if (page === 'blog' && Blog) Blog.init();
  },

  _initAnalytics() {
    const recent = Storage.getRecentCheckIns(14);
    this._renderAnalyticsChart(recent);
    this._renderMoodHeatmap(recent);
    this._renderStats(recent);
  },

  _renderAnalyticsChart(checkIns) {
    const canvas = document.getElementById('analytics-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const recent = checkIns.slice(-14);
    const labels = recent.map(c => c.date || '');
    const data = recent.map(c => c.score || 0);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Wellness Score',
          data,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167,139,250,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#a78bfa'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: 'rgba(148,163,184,0.1)' } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  _renderMoodHeatmap(checkIns) {
    const heatmap = document.getElementById('mood-heatmap');
    if (!heatmap) return;

    const moodColors = {
      great: '#4ade80',
      good: '#86efac',
      okay: '#fbbf24',
      low: '#f87171',
      awful: '#ef4444'
    };

    if (!checkIns || checkIns.length === 0) {
      heatmap.innerHTML = '<p class="empty-text">No data yet.</p>';
      return;
    }

    const recent = checkIns.slice(-28);
    heatmap.innerHTML = recent.map(c => {
      const color = moodColors[c.mood] || '#718096';
      return `<div class="heatmap-cell" style="background:${color}" title="${c.mood}"></div>`;
    }).join('');
  },

  _renderStats(checkIns) {
    if (!checkIns || checkIns.length === 0) return;

    const scores = checkIns.map(c => c.score || 0);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);

    const statAvgEl = document.getElementById('stat-avg');
    const statBestEl = document.getElementById('stat-best');
    const statStreakEl = document.getElementById('stat-streak');

    if (statAvgEl) statAvgEl.textContent = avg;
    if (statBestEl) statBestEl.textContent = best;
    if (statStreakEl) statStreakEl.textContent = checkIns.length;
  },
};
