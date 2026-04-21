// logic.js — ZenVitals scoring engine

const Logic = {
  // Core formula: score = (energy*0.3) + ((10-stress)*0.3) + (sleep_norm*0.2) + (activity*0.2)
  // All inputs normalized to 0–10 scale before weighting
  // Final score is 0–100

  MOOD_SCORES: {
    great: 10,
    good: 7.5,
    okay: 5,
    low: 2.5,
    awful: 0,
  },

  SLEEP_IDEAL: 8, // hours

  calculateScore({ energy, stress, sleepHours, activity, mood }) {
    const e = this.clamp(energy, 0, 10);
    const s = this.clamp(stress, 0, 10);
    const sl = this.normalizeSleep(sleepHours);
    const a = this.clamp(activity, 0, 10);

    const raw =
      e * 0.3 +
      (10 - s) * 0.3 +
      sl * 0.2 +
      a * 0.2;

    // Mood acts as a multiplier ±10%
    const moodBonus = mood ? (this.MOOD_SCORES[mood] - 5) * 0.02 : 0;

    return Math.round(this.clamp((raw + moodBonus) * 10, 0, 100));
  },

  // Normalize sleep: ideal is 8hrs (score 10), below 5 or above 11 penalized
  normalizeSleep(hours) {
    if (hours >= 7 && hours <= 9) return 10;
    if (hours < 5) return Math.max(0, hours - 2);
    if (hours > 10) return Math.max(0, 14 - hours);
    return 10 - Math.abs(hours - 8) * 1.5;
  },

  // Category scores (0–100 each)
  getCategoryScores({ energy, stress, sleepHours, activity, mood }) {
    const moodVal = mood ? this.MOOD_SCORES[mood] : 5;

    const physical = Math.round(
      this.clamp(
        (this.clamp(energy, 0, 10) * 0.4 +
          this.normalizeSleep(sleepHours) * 0.35 +
          this.clamp(activity, 0, 10) * 0.25) *
        10,
        0,
        100
      )
    );

    const mental = Math.round(
      this.clamp(
        ((10 - this.clamp(stress, 0, 10)) * 0.5 +
          moodVal * 0.3 +
          this.normalizeSleep(sleepHours) * 0.2) *
        10,
        0,
        100
      )
    );

    const emotional = Math.round(
      this.clamp(
        (moodVal * 0.5 +
          (10 - this.clamp(stress, 0, 10)) * 0.3 +
          this.clamp(energy, 0, 10) * 0.2) *
        10,
        0,
        100
      )
    );

    return { physical, mental, emotional };
  },

  getScoreLabel(score) {
    if (score >= 80) return { label: 'Thriving', color: '#4ade80', emoji: '🌟' };
    if (score >= 60) return { label: 'Balanced', color: '#86efac', emoji: '✨' };
    if (score >= 40) return { label: 'Steady', color: '#fbbf24', emoji: '🌤' };
    if (score >= 20) return { label: 'Depleted', color: '#f87171', emoji: '🌧' };
    return { label: 'Critical', color: '#ef4444', emoji: '⚠️' };
  },

  getTrend(checkIns) {
    if (checkIns.length < 2) return 'neutral';
    const scores = checkIns.map(c => c.score);
    const recent = scores.slice(-3);
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    if (recent.length < 2) return 'neutral';
    return avg(recent.slice(1)) > avg(recent.slice(0, 1)) ? 'up' : 'down';
  },

  clamp(val, min, max) {
    return Math.min(max, Math.max(min, Number(val) || 0));
  },
};

