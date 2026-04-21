/**
 * ================================================
 * ZenVitals – AI Insights Module
 * ================================================
 * 
 * Purpose:
 * Generates AI-powered wellness insights
 * and personalized recommendations.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * AI Configuration
   */
  const AI_CONFIG = {
    model: 'zenvitals-v1',
    minEntriesRequired: 3,
    insightsUpdateInterval: 24 * 60 * 60 * 1000 // 24 hours
  };

  /**
   * Insight categories
   */
  const CATEGORIES = {
    mood: 'Mood Analysis',
    sleep: 'Sleep Quality',
    activity: 'Activity Level',
    social: 'Social Connection',
    overall: 'Overall Wellness'
  };

  /**
   * AI insights state
   */
  let insightsState = {
    lastGenerated: null,
    currentInsights: []
  };

  /**
   * Initialize AI insights
   * @public
   */
  function init() {
    console.log('Initializing AI Insights...');
    loadCachedInsights();
    generate();
  }

  /**
   * Generate new insights
   * @public
   */
  function generate() {
    const entries = Storage.get('mood_entries') || [];
    
    // Check minimum entries
    if (entries.length < AI_CONFIG.minEntriesRequired) {
      showNeedMoreData();
      return;
    }

    // Check if we need to regenerate
    if (shouldSkipRegeneration()) {
      displayCurrentInsights();
      return;
    }

    // Generate new insights
    const insights = analyzeData(entries);
    
    // Cache insights
    cacheInsights(insights);
    
    // Display insights
    displayInsights(insights);
  }

  /**
   * Analyze user data and generate insights
   * @private
   * @param {Array} entries - Mood entries
   * @returns {Array} Generated insights
   */
  function analyzeData(entries) {
    const insights = [];
    const recent = getRecentEntries(entries, 7);
    const older = getRecentEntries(entries, 14).filter(e => 
      !recent.some(r => r.id === e.id)
    );

    // Analyze mood patterns
    insights.push(analyzeMoodPattern(recent));

    // Analyze trends
    if (older.length > 0) {
      insights.push(analyzeTrend(recent, older));
    }

    // Generate recommendations
    insights.push(generateRecommendations(entries));

    // Analyze sleep if available
    const sleepData = getSleepData(entries);
    if (sleepData.length > 0) {
      insights.push(analyzeSleep(sleepData));
    }

    // Analyze activity
    const activityData = getActivityData(entries);
    if (activityData.length > 0) {
      insights.push(analyzeActivity(activityData));
    }

    return insights;
  }

  /**
   * Analyze mood pattern
   * @private
   * @param {Array} entries - Recent entries
   * @returns {Object} Insight object
   */
  function analyzeMoodPattern(entries) {
    const moods = entries.map(e => e.mood);
    const moodCounts = {};
    
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    let insight = '';
    let type = 'positive';

    switch (dominantMood) {
      case 'happy':
        insight = 'You\'ve been feeling happy lately! Keep doing what makes you happy.';
        break;
      case 'good':
        insight = 'You\'re in a good place emotionally. Maintain this positive momentum.';
        break;
      case 'neutral':
        insight = 'Your mood has been stable. Consider trying new activities to boost your spirits.';
        type = 'neutral';
        break;
      case 'bad':
        insight = 'It seems you\'ve had some challenging days. Remember to be kind to yourself.';
        type = 'warning';
        break;
      case 'terrible':
        insight = 'I notice you\'ve been going through a difficult time. Please consider talking to someone you trust.';
        type = 'alert';
        break;
    }

    return {
      category: CATEGORIES.mood,
      title: 'Mood Patterns',
      text: insight,
      type: type
    };
  }

  /**
   * Analyze mood trend
   * @private
   * @param {Array} recent - Recent entries
   * @param {Array} older - Older entries
   * @returns {Object} Insight object
   */
  function analyzeTrend(recent, older) {
    const recentAvg = getAverageMood(recent);
    const olderAvg = getAverageMood(older);
    
    const diff = recentAvg - olderAvg;
    let insight = '';
    let type = 'positive';

    if (diff > 15) {
      insight = 'Great news! Your mood has improved significantly compared to last week. Whatever you\'re doing, keep it up!';
    } else if (diff < -15) {
      insight = 'Your mood seems to have dipped compared to last week. Try to identify what\'s causing stress and address it.';
      type = 'warning';
    } else {
      insight = 'Your emotional state has been consistent. Stability is a good foundation for growth.';
      type = 'neutral';
    }

    return {
      category: CATEGORIES.overall,
      title: 'Mood Trend',
      text: insight,
      type: type
    };
  }

  /**
   * Generate personalized recommendations
   * @private
   * @param {Array} entries - All entries
   * @returns {Object} Insight object
   */
  function generateRecommendations(entries) {
    const recommendations = [];
    
    // Check sleep patterns
    const sleepData = getSleepData(entries);
    if (sleepData.length > 0) {
      const avgSleep = getAverage(sleepData, 'sleep');
      if (avgSleep < 7) {
        recommendations.push('Try to get at least 7-8 hours of sleep for better mood regulation.');
      }
    }

    // Check exercise
    const exerciseData = getActivityData(entries);
    if (exerciseData.length > 0) {
      const avgExercise = getAverage(exerciseData, 'exercise');
      if (avgExercise < 30) {
        recommendations.push('Regular physical activity can boost your mood. Try a 30-minute walk today.');
      }
    }

    // Check notes for stress
    const stressedEntries = entries.filter(e => 
      e.factors && e.factors.notes && 
      e.factors.notes.toLowerCase().includes('stress')
    );
    if (stressedEntries.length > 2) {
      recommendations.push('You\'ve mentioned stress several times. Consider trying meditation or deep breathing exercises.');
    }

    const text = recommendations.length > 0 
      ? recommendations.join(' ') 
      : 'You\'re doing great! Keep up your healthy habits and continue tracking your wellness.';

    return {
      category: CATEGORIES.overall,
      title: 'Recommendations',
      text: text,
      type: 'neutral',
      isRecommendation: true
    };
  }

  /**
   * Analyze sleep data
   * @private
   * @param {Array} sleepData - Sleep entries
   * @returns {Object} Insight object
   */
  function analyzeSleep(sleepData) {
    const avgHours = getAverage(sleepData, 'sleep');
    let insight = '';
    let type = 'positive';

    if (avgHours >= 7 && avgHours <= 9) {
      insight = `You're getting great sleep! Averaging ${avgHours.toFixed(1)} hours per night is ideal for mental health.`;
    } else if (avgHours < 7) {
      insight = `You're averaging ${avgHours.toFixed(1)} hours of sleep. Try to get at least 7 hours for better mood and energy.`;
      type = 'warning';
    } else {
      insight = `You're sleeping ${avgHours.toFixed(1)} hours on average. Make sure you're balancing rest with activity.`;
      type = 'neutral';
    }

    return {
      category: CATEGORIES.sleep,
      title: 'Sleep Analysis',
      text: insight,
      type: type
    };
  }

   /**
   * Analyze activity data
   * @private
   * @param {Array} activityData - Activity entries
   * @returns {Object} Insight object
   */
  function analyzeActivity(activityData) {
    const avgMinutes = getAverage(activityData, 'exercise');
    let insight = '';
    let type = 'positive';

    if (avgMinutes >= 30) {
      insight = `Great job staying active! You're averaging ${avgMinutes.toFixed(0)} minutes of activity daily.`;
    } else if (avgMinutes > 0) {
      insight = `You're averaging ${avgMinutes.toFixed(0)} minutes of activity. Try to increase to 30 minutes for optimal benefits.`;
      type = 'warning';
    } else {
      insight = 'No activity data recorded yet. Starting with a short walk can make a big difference in how you feel.';
      type = 'neutral';
    }

    return {
      category: CATEGORIES.activity,
      title: 'Activity Check',
      text: insight,
      type: type
    };
  }

  // Utility functions

  function getRecentEntries(entries, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return entries.filter(entry => new Date(entry.date) >= cutoff);
  }

  function getAverageMood(entries) {
    const weights = { happy: 100, good: 75, neutral: 50, bad: 25, terrible: 0 };
    const total = entries.reduce((sum, e) => sum + (weights[e.mood] || 50), 0);
    return entries.length > 0 ? total / entries.length : 50;
  }

  function getSleepData(entries) {
    return entries.filter(e => e.factors && e.factors.sleep);
  }

  function getActivityData(entries) {
    return entries.filter(e => e.factors && e.factors.exercise);
  }

  function getAverage(data, field) {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item.factors[field] || 0), 0);
    return sum / data.length;
  }

  function shouldSkipRegeneration() {
    if (!insightsState.lastGenerated) return false;
    
    const timeSinceLastGeneration = Date.now() - insightsState.lastGenerated;
    return timeSinceLastGeneration < AI_CONFIG.insightsUpdateInterval;
  }

  function cacheInsights(insights) {
    insightsState.currentInsights = insights;
    insightsState.lastGenerated = Date.now();
    Storage.set('ai_insights', insightsState);
  }

  function loadCachedInsights() {
    const cached = Storage.get('ai_insights');
    if (cached) {
      insightsState = cached;
    }
  }

  function showNeedMoreData() {
    const container = document.getElementById('insights-container');
    if (container) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="font-size: 3rem; margin-bottom: 16px;">📊</div>
          <h3 style="margin-bottom: 8px;">Keep Tracking!</h3>
          <p class="text-muted">Log at least ${AI_CONFIG.minEntriesRequired} mood entries to receive personalized AI insights.</p>
        </div>
      `;
    }
  }

  function displayCurrentInsights() {
    displayInsights(insightsState.currentInsights);
  }

  function displayInsights(insights) {
    const container = document.getElementById('insights-container');
    if (!container) return;

    const html = insights.map(insight => `
      <div class="card insight-card" style="margin-bottom: 16px; background: ${getInsightBackground(insight.type)};">
        <div class="card-header">
          <span class="card-title">${insight.title}</span>
          <span>${getTypeIcon(insight.type)}</span>
        </div>
        <p style="font-size: 1rem; line-height: 1.6;">${insight.text}</p>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  function getInsightBackground(type) {
    const backgrounds = {
      positive: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      alert: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
      neutral: 'linear-gradient(135deg, #4A90A4 0%, #3A7A8E 100%)'
    };
    return backgrounds[type] || backgrounds.neutral;
  }

  function getTypeIcon(type) {
    const icons = {
      positive: '😊',
      warning: '⚠️',
      alert: '🆘',
      neutral: '💭'
    };
    return icons[type] || '💭';
  }

  // Expose public API
  window.AIInsights = {
    init: init,
    generate: generate
  };

})();