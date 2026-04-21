/**
 * ================================================
 * ZenVitals – Logic Module
 * ================================================
 * 
 * Purpose:
 * Handles scoring calculations, wellness 
 * metrics, and data processing.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * Score configuration
   */
  const SCORE_CONFIG = {
    moodWeights: {
      happy: 100,
      good: 75,
      neutral: 50,
      bad: 25,
      terrible: 0
    },
    categoryWeights: {
      mood: 0.4,
      sleep: 0.3,
      exercise: 0.2,
      social: 0.1
    }
  };

  /**
   * Calculate overall wellness score
   * @public
   * @param {Object} data - User data
   * @returns {number} Wellness score (0-100)
   */
  function calculateWellnessScore(data) {
    if (!data || !data.moodEntries || data.moodEntries.length === 0) {
      return 50; // Default neutral score
    }

    const recentEntries = getRecentEntries(data.moodEntries, 7);
    const weights = SCORE_CONFIG.categoryWeights;

    // Calculate component scores
    const moodScore = calculateMoodScore(recentEntries);
    const sleepScore = calculateSleepScore(data.sleepData);
    const exerciseScore = calculateExerciseScore(data.exerciseData);
    const socialScore = calculateSocialScore(data.socialData);

    // Weighted average
    const totalScore = 
      (moodScore * weights.mood) +
      (sleepScore * weights.sleep) +
      (exerciseScore * weights.exercise) +
      (socialScore * weights.social);

    return Math.round(totalScore);
  }

  /**
   * Calculate mood sub-score
   * @private
   * @param {Array} entries - Mood entries
   * @returns {number} Mood score (0-100)
   */
  function calculateMoodScore(entries) {
    if (!entries || entries.length === 0) {
      return 50;
    }

    const weights = SCORE_CONFIG.moodWeights;
    const total = entries.reduce((sum, entry) => {
      return sum + (weights[entry.mood] || 50);
    }, 0);

    return Math.round(total / entries.length);
  }

  /**
   * Calculate sleep sub-score
   * @private
   * @param {Array} sleepData - Sleep entries
   * @returns {number} Sleep score (0-100)
   */
  function calculateSleepScore(sleepData) {
    if (!sleepData || sleepData.length === 0) {
      return 50;
    }

    // Simple calculation based on hours
    // Ideal: 7-9 hours = 100, <5 or >10 = 0
    const recent = sleepData.slice(-7);
    const total = recent.reduce((sum, entry) => {
      const hours = entry.hours || 7;
      if (hours >= 7 && hours <= 9) return sum + 100;
      if (hours >= 6 && hours < 7) return sum + 80;
      if (hours >= 5 && hours < 6) return sum + 60;
      if (hours >= 9 && hours < 10) return sum + 80;
      return sum + 40;
    }, 0);

    return Math.round(total / recent.length);
  }

  /**
   * Calculate exercise sub-score
   * @private
   * @param {Array} exerciseData - Exercise entries
   * @returns {number} Exercise score (0-100)
   */
  function calculateExerciseScore(exerciseData) {
    if (!exerciseData || exerciseData.length === 0) {
      return 0;
    }

    const recent = exerciseData.slice(-7);
    const activeDays = recent.filter(e => e.minutes >= 30).length;
    
    return Math.round((activeDays / 7) * 100);
  }

  /**
   * Calculate social sub-score
   * @private
   * @param {Array} socialData - Social entries
   * @returns {number} Social score (0-100)
   */
  function calculateSocialScore(socialData) {
    if (!socialData || socialData.length === 0) {
      return 50;
    }

    const recent = socialData.slice(-7);
    const socialDays = recent.filter(e => e.interactions > 0).length;
    
    return Math.round((socialDays / 7) * 100);
  }

  /**
   * Get recent entries for a time period
   * @private
   * @param {Array} entries - All entries
   * @param {number} days - Number of days
   * @returns {Array} Recent entries
   */
  function getRecentEntries(entries, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoff;
    });
  }

  /**
   * Calculate mood trend
   * @public
   * @param {Array} entries - Mood entries
   * @returns {string} Trend direction
   */
  function calculateMoodTrend(entries) {
    if (!entries || entries.length < 7) {
      return 'stable';
    }

    const recent = getRecentEntries(entries, 3);
    const previous = entries.slice(-7, -3);
    
    if (recent.length === 0 || previous.length === 0) {
      return 'stable';
    }

    const recentAvg = getAverageMood(recent);
    const previousAvg = getAverageMood(previous);
    
    const diff = recentAvg - previousAvg;
    
    if (diff > 15) return 'improving';
    if (diff < -15) return 'declining';
    return 'stable';
  }

  /**
   * Get average mood value
   * @private
   * @param {Array} entries - Mood entries
   * @returns {number} Average score
   */
  function getAverageMood(entries) {
    const weights = SCORE_CONFIG.moodWeights;
    const total = entries.reduce((sum, entry) => {
      return sum + (weights[entry.mood] || 50);
    }, 0);
    
    return total / entries.length;
  }

  /**
   * Get streak count
   * @public
   * @param {Array} entries - Entries to check
   * @returns {number} Current streak
   */
  function getStreakCount(entries) {
    if (!entries || entries.length === 0) {
      return 0;
    }

    let streak = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const entry of sorted) {
      if (entry.mood && entry.mood !== 'bad' && entry.mood !== 'terrible') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Expose public API
  window.WellnessLogic = {
    calculateWellnessScore: calculateWellnessScore,
    calculateMoodScore: calculateMoodScore,
    calculateMoodTrend: calculateMoodTrend,
    getStreakCount: getStreakCount,
    config: SCORE_CONFIG
  };

})();