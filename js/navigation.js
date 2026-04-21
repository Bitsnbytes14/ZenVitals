/**
 * ================================================
 * ZenVitals – Navigation Module
 * ================================================
 * 
 * Purpose:
 * Handles page/section switching and 
 * navigation state management.
 * 
 * @package ZenVitals
 */

(function() {
  'use strict';

  /**
   * Current active page
   */
  let activePage = 'home';

  /**
   * Page configurations
   */
  const pages = {
    home: {
      id: 'home',
      title: 'Welcome',
      icon: '🏠'
    },
    mood: {
      id: 'mood',
      title: 'Mood Tracker',
      icon: '😊'
    },
    dashboard: {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊'
    },
    insights: {
      id: 'insights',
      title: 'AI Insights',
      icon: '🤖'
    },
    reflect: {
      id: 'reflect',
      title: 'Reflect',
      icon: '📝'
    }
  };

  /**
   * Initialize navigation module
   * @public
   */
  function init() {
    console.log('Initializing Navigation...');
    setupNavigation();
    navigateTo('home');
  }

  /**
   * Setup navigation event listeners
   * @private
   */
  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const pageId = this.dataset.page;
        if (pageId) {
          navigateTo(pageId);
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        const pageMap = {
          '1': 'home',
          '2': 'mood',
          '3': 'dashboard',
          '4': 'insights',
          '5': 'reflect'
        };
        if (pageMap[key]) {
          e.preventDefault();
          navigateTo(pageMap[key]);
        }
      }
    });
  }

  /**
   * Navigate to a specific page
   * @public
   * @param {string} pageId - The target page ID
   */
  function navigateTo(pageId) {
    // Validate page exists
    if (!pages[pageId]) {
      console.error('Page not found:', pageId);
      return;
    }

    // Update active page
    activePage = pageId;

    // Update navigation UI
    updateNavigationUI(pageId);

    // Show target page
    showPage(pageId);

    // Update header title
    updateHeaderTitle(pages[pageId].title);

    // Trigger page-specific initialization
    onPageChange(pageId);

    console.log('Navigated to:', pageId);
  }

  /**
   * Update navigation UI state
   * @private
   * @param {string} pageId - The target page ID
   */
  function updateNavigationUI(pageId) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Show a specific page and hide others
   * @private
   * @param {string} pageId - The page ID to show
   */
  function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => {
      if (page.id === pageId) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
  }

  /**
   * Update header title
   * @private
   * @param {string} title - New header title
   */
  function updateHeaderTitle(title) {
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) {
      headerTitle.textContent = title;
    }
  }

  /**
   * Handle page change events
   * @private
   * @param {string} pageId - The new page ID
   */
  function onPageChange(pageId) {
    switch (pageId) {
      case 'dashboard':
        // Refresh dashboard data
        if (window.Dashboard && Dashboard.refresh) {
          Dashboard.refresh();
        }
        break;
      case 'insights':
        // Generate new insights if needed
        if (window.AIInsights && AIInsights.generate) {
          AIInsights.generate();
        }
        break;
      case 'mood':
        // Reset mood form if needed
        if (window.MoodTracker && MoodTracker.reset) {
          MoodTracker.reset();
        }
        break;
      case 'reflect':
        // Prepare journal form
        break;
      default:
        break;
    }
  }

  /**
   * Get the current active page
   * @public
   * @returns {string} Current page ID
   */
  function getActivePage() {
    return activePage;
  }

  /**
   * Get all available pages
   * @public
   * @returns {Object} Page configurations
   */
  function getPages() {
    return { ...pages };
  }

  // Expose public API
  window.Navigation = {
    init: init,
    navigateTo: navigateTo,
    getActivePage: getActivePage,
    getPages: getPages
  };

})();