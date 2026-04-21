/**
 * ================================================
 * ZenVitals – Storage Module
 * ================================================
 * 
 * Purpose:
 * Handles all localStorage operations for
 * persisting user data.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * Storage configuration
   */
  const STORAGE_CONFIG = {
    prefix: 'zv_',
    version: '1.0'
  };

  /**
   * Storage keys enumeration
   */
  const STORAGE_KEYS = {
    USER_DATA: 'user_data',
    MOOD_ENTRIES: 'mood_entries',
    JOURNAL_ENTRIES: 'journal_entries',
    INSIGHTS: 'insights',
    PREFERENCES: 'preferences',
    LAST_SYNC: 'last_sync'
  };

  /**
   * Get item from localStorage
   * @public
   * @param {string} key - Storage key
   * @returns {*} Parsed value or null
   */
  function get(key) {
    try {
      const fullKey = getFullKey(key);
      const value = localStorage.getItem(fullKey);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   * @public
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  function set(key, value) {
    try {
      const fullKey = getFullKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @public
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  function remove(key) {
    try {
      const fullKey = getFullKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Check if storage key exists
   * @public
   * @param {string} key - Storage key
   * @returns {boolean} Exists status
   */
  function exists(key) {
    const fullKey = getFullKey(key);
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * Clear all app storage
   * @public
   * @returns {boolean} Success status
   */
  function clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        const fullKey = getFullKey(key);
        localStorage.removeItem(fullKey);
      });
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get full storage key with prefix
   * @private
   * @param {string} key - Base key
   * @returns {string} Full key
   */
  function getFullKey(key) {
    return STORAGE_CONFIG.prefix + key;
  }

  /**
   * Export all user data
   * @public
   * @returns {Object} All stored data
   */
  function exportData() {
    const data = {};
    
    Object.keys(STORAGE_KEYS).forEach(key => {
      const value = get(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    
    return data;
  }

  /**
   * Import user data
   * @public
   * @param {Object} data - Data to import
   * @returns {boolean} Success status
   */
  function importData(data) {
    try {
      Object.keys(data).forEach(key => {
        set(key, data[key]);
      });
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }

  /**
   * Get storage usage info
   * @public
   * @returns {Object} Storage info
   */
  function getStorageInfo() {
    let totalSize = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_CONFIG.prefix)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    return {
      usedBytes: totalSize,
      usedKB: (totalSize / 1024).toFixed(2),
      usedMB: (totalSize / 1024 / 1024).toFixed(4)
    };
  }

  // Expose public API
  window.Storage = {
    get: get,
    set: set,
    remove: remove,
    exists: exists,
    clear: clear,
    exportData: exportData,
    importData: importData,
    getStorageInfo: getStorageInfo,
    keys: STORAGE_KEYS
  };

})();