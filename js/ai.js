// dashboard.js — ZenVitals dashboard renderer

const Dashboard = {
  charts: {},

  init() {
    this.refresh();
  },

  refresh() {
    const latest = Storage.getLatestCheckIn();
    const recent = Storage.getRecentCheckIns(7);

    if (!latest) {
      this._showEmptyState();
      return;
    }

    this._hideEmptyState();
    this._renderScore(latest);
    this._renderCategories(latest.categories);
    this._renderInsights(latest);
    this._renderTrendChart(recent);
    this._renderMoodHeatmap(recent);
    this._renderStats(recent);
  },

  _renderScore(entry) {
    const scoreEl = document.getElementById('main-score');
    const labelEl = document.getElementById('score-label');
    const circleEl = document.getElementById('score-circle-fill');
    if (!scoreEl) return;

    const label = Logic.getScoreLabel(entry.score);
    scoreEl.textContent = entry.score;
    if (labelEl) {
      labelEl.textContent = `${label.emoji} ${label.label}`;
      labelEl.style.color = label.color;
    }

    // Animate circular progress
    if (circleEl) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (entry.score / 100) * circumference;
      circleEl.style.strokeDasharray = circumference;
      circleEl.style.strokeDashoffset = circumference;
      circleEl.style.stroke = label.color;
      setTimeout(() => {
        circleEl.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
        circleEl.style.strokeDashoffset = offset;
      }, 100);
    }

    // Update streak/date
    const dateEl = document.getElementById('last-checkin-date');
    if (dateEl) dateEl.textContent = `Last check-in: ${entry.date}`;
  },

  _renderCategories(cats) {
    if (!cats) return;
    ['physical', 'mental', 'emotional'].forEach(cat => {
      const bar = document.getElementById(`${cat}-bar`);
      const val = document.getElementById(`${cat}-val`);
      const score = cats[cat] || 0;
      if (bar) {
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1)';
          bar.style.width = `${score}%`;
          const hue = Math.round((score / 100) * 120);
          bar.style.background = `hsl(${hue}, 70%, 55%)`;
        }, 300);
      }
      if (val) val.textContent = score;
    });
  },

  _renderInsights(entry) {
    const container = document.getElementById('insights-container');
    if (!container) return;
    const insights = AI.generateInsights(entry);

    container.innerHTML = insights.map(ins => `
      <div class="insight-card insight-${ins.type}">
        <div class="insight-header">
          <span class="insight-icon">${ins.icon}</span>
          <span class="insight-title">${ins.title}</span>
        </div>
        <p class="insight-body">${ins.body}</p>
        <div class="insight-action">
          <span class="action-icon">→</span> ${ins.action}
        </div>
      </div>
    `).join('');
  },

  _renderTrendChart(recent) {
    const canvas = document.getElementById('trend-chart');
    if (!canvas || recent.length < 1) return;

    // Destroy old chart if exists
    if (this.charts.trend) {
      this.charts.trend.destroy();
    }

    const labels = recent.map(c => c.date || '');
    const scores = recent.map(c => c.score);
    const physical = recent.map(c => c.categories?.physical || 0);
    const mental = recent.map(c => c.categories?.mental || 0);
    const emotional = recent.map(c => c.categories?.emotional || 0);

    const ctx = canvas.getContext('2d');

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Overall',
            data: scores,
            borderColor: '#a78bfa',
            backgroundColor: 'rgba(167,139,250,0.12)',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#a78bfa',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Physical',
            data: physical,
            borderColor: '#4ade80',
            borderWidth: 1.5,
            pointRadius: 3,
            borderDash: [4, 4],
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Mental',
            data: mental,
            borderColor: '#60a5fa',
            borderWidth: 1.5,
            pointRadius: 3,
            borderDash: [4, 4],
            fill: false,
            tension: 0.4,
          },
          {
            label: 'Emotional',
            data: emotional,
            borderColor: '#f472b6',
            borderWidth: 1.5,
            pointRadius: 3,
            borderDash: [4, 4],
            fill: false,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(148,163,184,0.08)' },
            ticks: { color: '#64748b', font: { size: 10 } },
          },
          x: {
            grid: { color: 'rgba(148,163,184,0.05)' },
            ticks: { color: '#64748b', font: { size: 10 } },
          },
        },
      },
    });
  },

  _renderMoodHeatmap(recent) {
    const container = document.getElementById('mood-heatmap');
    if (!container) return;

    const moodColors = {
      great: '#4ade80',
      good: '#86efac',
      okay: '#fbbf24',
      low: '#f87171',
      awful: '#ef4444',
    };

    const moodEmojis = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      low: '😔',
      awful: '😣',
    };

    container.innerHTML = recent.map(entry => `
      <div class="heatmap-cell" style="background:${moodColors[entry.mood] || '#334155'}22; border-color:${moodColors[entry.mood] || '#334155'}">
        <span class="heatmap-emoji">${moodEmojis[entry.mood] || '❓'}</span>
        <span class="heatmap-date">${entry.date}</span>
        <span class="heatmap-score">${entry.score}</span>
      </div>
    `).join('');
  },

  _renderStats(recent) {
    if (!recent.length) return;
    const scores = recent.map(c => c.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const streak = recent.length;

    const avgEl = document.getElementById('stat-avg');
    const bestEl = document.getElementById('stat-best');
    const streakEl = document.getElementById('stat-streak');

    if (avgEl) avgEl.textContent = avg;
    if (bestEl) bestEl.textContent = best;
    if (streakEl) streakEl.textContent = streak;
  },

  _showEmptyState() {
    const empty = document.getElementById('dashboard-empty');
    const content = document.getElementById('dashboard-content');
    if (empty) empty.style.display = 'flex';
    if (content) content.style.display = 'none';
  },

  _hideEmptyState() {
    const empty = document.getElementById('dashboard-empty');
    const content = document.getElementById('dashboard-content');
    if (empty) empty.style.display = 'none';
    if (content) content.style.display = 'block';
  },
};
