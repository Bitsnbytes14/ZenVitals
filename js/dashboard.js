/**
 * ================================================
 * ZenVitals – Dashboard Module
 * ================================================
 * 
 * Purpose:
 * Updates and manages the dashboard UI,
 * displays statistics and metrics.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * Chart instance
   */
  let trendChart = null;

  /**
   * Initialize dashboard
   * @public
   */
  function init() {
    cacheElements();
    refresh();
  }

  /**
   * Cache DOM elements
   * @private
   */
  function cacheElements() {
    elements = {
      mainScore: document.getElementById('main-score'),
      scoreLabel: document.getElementById('score-label'),
      lastCheckinDate: document.getElementById('last-checkin-date'),
      scoreCircleFill: document.getElementById('score-circle-fill'),
      physicalBar: document.getElementById('physical-bar'),
      physicalVal: document.getElementById('physical-val'),
      mentalBar: document.getElementById('mental-bar'),
      mentalVal: document.getElementById('mental-val'),
      emotionalBar: document.getElementById('emotional-bar'),
      emotionalVal: document.getElementById('emotional-val'),
      statAvg: document.getElementById('stat-avg'),
      statBest: document.getElementById('stat-best'),
      statStreak: document.getElementById('stat-streak'),
      insightsContainer: document.getElementById('insights-container'),
      dashboardEmpty: document.getElementById('dashboard-empty'),
      dashboardContent: document.getElementById('dashboard-content')
    };
  }

  /**
   * Dashboard elements cache
   */
  let elements = {};

  /**
   * Refresh dashboard data
   * @public
   */
  function refresh() {
    cacheElements(); // Always re-cache — refresh() may be called before init()
    const checkIns = AppStorage.getCheckIns();
    const latest = AppStorage.getLatestCheckIn();

    if (!latest) {
      showEmptyState();
      return;
    }

    hideEmptyState();
    updateScoreDisplay(latest);
    updateCategoryBars(latest);
    updateQuickStats(checkIns);
    renderTrendChart(checkIns);
    renderInsights(latest);
  }

  /**
   * Show empty state
   */
  function showEmptyState() {
    if (elements.dashboardEmpty) elements.dashboardEmpty.style.display = 'block';
    if (elements.dashboardContent) elements.dashboardContent.style.display = 'none';
  }

  /**
   * Hide empty state
   */
  function hideEmptyState() {
    if (elements.dashboardEmpty) elements.dashboardEmpty.style.display = 'none';
    if (elements.dashboardContent) elements.dashboardContent.style.display = 'block';
  }

  /**
   * Update score display
   */
  function updateScoreDisplay(latest) {
    if (!latest || !latest.score) return;

    const score = latest.score;
    const label = Logic.getScoreLabel(score);

    if (elements.mainScore) {
      elements.mainScore.textContent = score;
      elements.mainScore.style.color = label.color;
    }
    if (elements.scoreLabel) {
      elements.scoreLabel.textContent = label.label;
      elements.scoreLabel.style.color = label.color;
    }
    if (elements.lastCheckinDate) {
      elements.lastCheckinDate.textContent = latest.date || new Date().toLocaleDateString();
    }

    // Animate ring
    if (elements.scoreCircleFill) {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (score / 100) * circumference;
      elements.scoreCircleFill.style.strokeDashoffset = offset;
      elements.scoreCircleFill.style.stroke = label.color;
    }
  }

  /**
   * Update category bars
   */
  function updateCategoryBars(latest) {
    if (!latest || !latest.categories) return;

    const { physical, mental, emotional } = latest.categories;

    updateBar(elements.physicalBar, elements.physicalVal, physical, '#4ade80');
    updateBar(elements.mentalBar, elements.mentalVal, mental, '#60a5fa');
    updateBar(elements.emotionalBar, elements.emotionalVal, emotional, '#f472b6');
  }

  /**
   * Update single bar
   */
  function updateBar(barEl, valEl, value, color) {
    if (!barEl || !valEl) return;
    barEl.style.width = value + '%';
    barEl.style.background = color;
    valEl.textContent = value;
  }

  /**
   * Update quick stats
   */
  function updateQuickStats(checkIns) {
    if (!checkIns || checkIns.length === 0) return;

    const scores = checkIns.map(c => c.score || 0);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);

    if (elements.statAvg) elements.statAvg.textContent = avg;
    if (elements.statBest) elements.statBest.textContent = best;
    if (elements.statStreak) elements.statStreak.textContent = checkIns.length;
  }

  /**
   * Render trend chart
   */
  function renderTrendChart(checkIns) {
    const canvas = document.getElementById('trend-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const recent = checkIns.slice(-14);
    const labels = recent.map(c => c.date || '');
    const data = recent.map(c => c.score || 0);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(canvas, {
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
  }

  /**
   * Render AI insights
   */
  function renderInsights(latest) {
    if (!elements.insightsContainer || !AI) return;

    const insights = AI.generateInsights(latest);
    if (!insights || insights.length === 0) {
      elements.insightsContainer.innerHTML = '<p class="text-muted">Complete check-ins to see AI insights.</p>';
      return;
    }

    elements.insightsContainer.innerHTML = insights.map(insight => `
      <div class="insight-card insight-${insight.type || 'info'}">
        <div class="insight-header">
          <span class="insight-icon">${insight.icon || '💡'}</span>
          <span class="insight-title">${insight.title || ''}</span>
        </div>
        <p class="insight-body">${insight.body || ''}</p>
        ${insight.action ? `<p class="insight-action">${insight.action}</p>` : ''}
      </div>
    `).join('');
  }

  // Expose public API
  window.Dashboard = {
    init,
    refresh
  };

})();