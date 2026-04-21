/**
 * ================================================
 * ZenVitals – Mood Module
 * ================================================
 * 
 * Purpose:
 * Handles mood tracking, user input,
 * and mood-related data processing.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * Mood options configuration
   */
  const MOOD_OPTIONS = [
    {
      id: 'happy',
      label: 'Happy',
      icon: '😊',
      color: '#4CAF50',
      description: 'Feeling joyful and content'
    },
    {
      id: 'good',
      label: 'Good',
      icon: '🙂',
      color: '#8BC34A',
      description: 'Doing well, feeling positive'
    },
    {
      id: 'neutral',
      label: 'Neutral',
      icon: '😐',
      color: '#FFC107',
      description: 'Neither good nor bad'
    },
    {
      id: 'bad',
      label: 'Bad',
      icon: '😔',
      color: '#FF9800',
      description: 'Feeling down or uneasy'
    },
    {
      id: 'terrible',
      label: 'Terrible',
      icon: '😢',
      color: '#F44336',
      description: 'Feeling very low'
    }
  ];

  /**
   * Current mood selection
   */
  let currentMood = null;

  /**
   * Additional factors
   */
  let factors = {
    sleep: null,
    exercise: null,
    social: null,
    notes: ''
  };

  /**
   * Initialize mood tracker
   * @public
   */
  function init() {
    console.log('Initializing Mood Tracker...');
    setupMoodSelector();
    loadTodayEntry();
  }

  /**
   * Setup mood selection UI
   * @private
   */
  function setupMoodSelector() {
    const moodOptions = document.querySelectorAll('.mood-option');
    
    moodOptions.forEach(option => {
      option.addEventListener('click', function() {
        selectMood(this.dataset.mood);
      });
    });

    // Setup factor inputs
    const sleepInput = document.getElementById('sleep-hours');
    const exerciseInput = document.getElementById('exercise-minutes');
    const notesInput = document.getElementById('mood-notes');

    if (sleepInput) {
      sleepInput.addEventListener('change', function() {
        factors.sleep = parseFloat(this.value);
      });
    }

    if (exerciseInput) {
      exerciseInput.addEventListener('change', function() {
        factors.exercise = parseInt(this.value);
      });
    }

    if (notesInput) {
      notesInput.addEventListener('input', function() {
        factors.notes = this.value;
      });
    }

    // Setup submit button
    const submitBtn = document.getElementById('submit-mood');
    if (submitBtn) {
      submitBtn.addEventListener('click', saveMoodEntry);
    }
  }

  /**
   * Handle mood selection
   * @public
   * @param {string} moodId - Selected mood ID
   */
  function selectMood(moodId) {
    // Update UI
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
      if (option.dataset.mood === moodId) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    // Store selection
    currentMood = moodId;
  }

  /**
   * Save mood entry
   * @private
   */
  function saveMoodEntry() {
    if (!currentMood) {
      showMessage('Please select a mood', 'error');
      return;
    }

    const entry = {
      id: generateId(),
      mood: currentMood,
      date: new Date().toISOString(),
      factors: { ...factors }
    };

    // Get existing entries
    const entries = Storage.get('mood_entries') || [];
    entries.push(entry);
    
    // Save to storage
    Storage.set('mood_entries', entries);

    // Show success message
    showMessage('Mood entry saved!', 'success');

    // Reset form
    reset();

    // Trigger dashboard refresh if on that page
    if (window.Dashboard && Dashboard.refresh) {
      Dashboard.refresh();
    }
  }

  /**
   * Load today's entry if exists
   * @private
   */
  function loadTodayEntry() {
    const entries = Storage.get('mood_entries') || [];
    const today = new Date().toDateString();
    
    const todayEntry = entries.find(entry => {
      return new Date(entry.date).toDateString() === today;
    });

    if (todayEntry) {
      selectMood(todayEntry.mood);
      currentMood = todayEntry.mood;

      // Load factors if available
      if (todayEntry.factors) {
        if (todayEntry.factors.sleep) {
          const sleepInput = document.getElementById('sleep-hours');
          if (sleepInput) sleepInput.value = todayEntry.factors.sleep;
        }
        if (todayEntry.factors.exercise) {
          const exerciseInput = document.getElementById('exercise-minutes');
          if (exerciseInput) exerciseInput.value = todayEntry.factors.exercise;
        }
        if (todayEntry.factors.notes) {
          const notesInput = document.getElementById('mood-notes');
          if (notesInput) notesInput.value = todayEntry.factors.notes;
        }
      }

      showMessage('You\'ve already logged your mood today', 'info');
    }
  }

  /**
   * Reset mood form
   * @public
   */
  function reset() {
    currentMood = null;
    factors = {
      sleep: null,
      exercise: null,
      social: null,
      notes: ''
    };

    // Reset UI
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
      option.classList.remove('selected');
    });

    const inputs = ['sleep-hours', 'exercise-minutes', 'mood-notes'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
  }

  /**
   * Get mood options
   * @public
   * @returns {Array} Mood options
   */
  function getMoodOptions() {
    return [...MOOD_OPTIONS];
  }

  /**
   * Get entries for date range
   * @public
   * @param {number} days - Number of days
   * @returns {Array} Mood entries
   */
  function getEntriesForDays(days) {
    const entries = Storage.get('mood_entries') || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return entries.filter(entry => {
      return new Date(entry.date) >= cutoff;
    });
  }

  // Utility functions
  function generateId() {
    return 'mood_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function showMessage(message, type) {
    // Simple message display - can be enhanced
    console.log(`[${type}] ${message}`);
    alert(message);
  }

  // Expose public API
  window.MoodTracker = {
    init: init,
    selectMood: selectMood,
    reset: reset,
    getMoodOptions: getMoodOptions,
    getEntriesForDays: getEntriesForDays
  };

})();