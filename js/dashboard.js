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
   * Dashboard elements cache
   */
  let elements = {};

  /**
   * Initialize dashboard
   * @public
   */
  function init() {
    console.log('Initializing Dashboard...');
    cacheElements();
    refresh();
  }

  /**
   * Cache DOM elements
   * @private
   */
  function cacheElements() {
    elements = {
      wellnessScore: document.getElementById('wellness-score'),
      streakCount: document.getElementById('streak-count'),
      entriesCount: document.getElementById('entries-count'),
      moodTrend: document.getElementById('mood-trend'),
      recentEntries: document.getElementById('recent-entries'),
      statsContainer: document.getElementById('stats-container')
    };
  }

  /**
   * Refresh dashboard data
   * @public
   */
  function refresh() {
    updateWellnessScore();
    updateStreak();
    updateEntryCount();
    updateMoodTrend();
    updateRecentEntries();
    updateStats();
  }

  /**
   * Update wellness score display
   * @private
   */
  function updateWellnessScore() {
    const entries = Storage.get('mood_entries') || [];
    const data = { moodEntries: entries };
    
    const score = window.WellnessLogic.calculateWellnessScore(data);
    
    if (elements.wellnessScore) {
      elements.wellnessScore.textContent = score;
      
      // Update color based on score
      const color = getScoreColor(score);
      elements.wellnessScore.style.color = color;
    }
  }

  /**
   * Update streak count display
   * @private
   */
  function updateStreak() {
    const entries = Storage.get('mood_entries') || [];
    const streak = window.WellnessLogic.getStreakCount(entries);
    
    if (elements.streakCount) {
      elements.streakCount.textContent = streak;
    }
  }

  /**
   * Update entries count
   * @private
   */
  function updateEntryCount() {
    const entries = Storage.get('mood_entries') || [];
    
    if (elements.entriesCount) {
      elements.entriesCount.textContent = entries.length;
    }
  }

  /**
   * Update mood trend display
   * @private
   */
  function updateMoodTrend() {
    const entries = Storage.get('mood_entries') || [];
    const trend = window.WellnessLogic.calculateMoodTrend(entries);
    
    if (elements.moodTrend) {
      const trendIcon = getTrendIcon(trend);
      const trendLabel = trend.charAt(0).toUpperCase() + trend.slice(1);
      elements.moodTrend.innerHTML = `${trendIcon} ${trendLabel}`;
    }
  }

  /**
   * Update recent entries list
   * @private
   */
  function updateRecentEntries() {
    if (!elements.recentEntries) return;
    
    const entries = Storage.get('mood_entries') || [];
    const recent = entries.slice(-5).reverse();
    
    if (recent.length === 0) {
      elements.recentEntries.innerHTML = '<p class="text-muted">No entries yet</p>';
      return;
    }

    const html = recent.map(entry => {
      const date = new Date(entry.date).toLocaleDateString();
      const moodIcon = getMoodIcon(entry.mood);
      
      return `
        <div class="recent-entry" style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--color-border);">
          <span style="font-size: 1.5rem;">${moodIcon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 500;">${capitalize(entry.mood)}</div>
            <div class="text-muted" style="font-size: 0.875rem;">${date}</div>
          </div>
        </div>
      `;
    }).join('');

    elements.recentEntries.innerHTML = html;
  }

  /**
   * Update additional stats
   * @private
   */
  function updateStats() {
    const entries = Storage.get('mood_entries') || [];
    
    // Calculate additional stats
    const avgSleep = calculateAverage(entries, 'factors.sleep');
    const avgExercise = calculateAverage(entries, 'factors.exercise');
    
    // Update HTML if stat elements exist
    const sleepEl = document.getElementById('avg-sleep');
    const exerciseEl = document.getElementById('avg-exercise');
    
    if (sleepEl && avgSleep) {
      sleepEl.textContent = avgSleep.toFixed(1) + ' hrs';
    }
    
    if (exerciseEl && avgExercise) {
      exerciseEl.textContent = avgExercise + ' min';
    }
  }

  /**
   * Get color for score
   * @private
   * @param {number} score - Wellness score
   * @returns {string} Color hex code
   */
  function getScoreColor(score) {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    if (score >= 20) return '#FF9800';
    return '#F44336';
  }

  /**
   * Get icon for trend
   * @private
   * @param {string} trend - Trend direction
   * @returns {string} Trend icon
   */
  function getTrendIcon(trend) {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  }

  /**
   * Get icon for mood
   * @private
   * @param {string} moodId - Mood ID
   * @returns {string} Mood icon
   */
  function getMoodIcon(moodId) {
    const icons = {
      happy: '😊',
      good: '🙂',
      neutral: '😐',
      bad: '😔',
      terrible: '😢'
    };
    return icons[moodId] || '😐';
  }

  /**
   * Calculate average for a field
   * @private
   * @param {Array} entries - Entries
   * @param {string} field - Field path
   * @returns {number} Average value
   */
  function calculateAverage(entries, field) {
    const values = entries
      .map(e => {
        if (field.includes('.')) {
          const parts = field.split('.');
          return e[parts[0]] ? e[parts[0]][parts[1]] : null;
        }
        return e[field];
      })
      .filter(v => v !== null && !isNaN(v));
    
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  /**
   * Capitalize first letter
   * @private
   * @param {string} str - String
   * @returns {string} Capitalized string
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Expose public API
  window.Dashboard = {
    init: init,
    refresh: refresh
  };

})();