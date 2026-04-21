/**
 * ================================================
 * ZenVitals – Main Application Entry Point
 * ================================================
 * 
 * Purpose: 
 * Initializes the application and coordinates
 * all module loading.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * App Configuration
   */
  const APP_CONFIG = {
    name: 'ZenVitals',
    version: '1.0.0',
    storageKey: 'zenvitals_data'
  };

  /**
   * Application State
   */
  let appState = {
    currentPage: 'home',
    isInitialized: false,
    userData: {}
  };

  /**
   * Initialize the application
   * @public
   */
  function init() {
    console.log('Initializing ZenVitals...');
    
    try {
      // Load user data from storage
      loadUserData();
      
      // Initialize all modules
      initModules();
      
      // Setup navigation
      Navigation.init();
      
      // Setup event listeners
      setupEventListeners();
      
      // Mark as initialized
      appState.isInitialized = true;
      
      console.log('ZenVitals initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  /**
   * Load user data from localStorage
   * @private
   */
  function loadUserData() {
    const stored = Storage.get(APP_CONFIG.storageKey);
    if (stored) {
      appState.userData = stored;
    } else {
      // Initialize with default data
      appState.userData = {
        moodEntries: [],
        journal: [],
        insights: [],
        preferences: {}
      };
      Storage.set(APP_CONFIG.storageKey, appState.userData);
    }
  }

  /**
   * Initialize all modules
   * @private
   */
  function initModules() {
    // Modules are initialized through their own init() methods
    // called after they're loaded
    Dashboard.init();
    MoodTracker.init();
    AIInsights.init();
  }

  /**
   * Setup global event listeners
   * @private
   */
  function setupEventListeners() {
    // Handle visibility change for data persistence
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        loadUserData();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', function() {
      saveUserData();
    });
  }

  /**
   * Save user data to localStorage
   * @public
   */
  function saveUserData() {
    Storage.set(APP_CONFIG.storageKey, appState.userData);
  }

  /**
   * Get the current app state
   * @public
   * @returns {Object} Current app state
   */
  function getAppState() {
    return { ...appState };
  }

  /**
   * Update app state
   * @public
   * @param {Object} updates - State properties to update
   */
  function updateState(updates) {
    Object.assign(appState, updates);
    saveUserData();
  }

  // Expose public API
  window.ZenVitals = {
    init: init,
    getState: getAppState,
    updateState: updateState,
    saveData: saveUserData,
    config: APP_CONFIG
  };

})();