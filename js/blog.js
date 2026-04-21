// blog.js — ZenVitals Blog / Knowledge Hub Module

const Blog = {
  articles: [
    {
      id: 1,
      title: 'Understanding Stress: Causes and Coping Strategies',
      description: 'Learn to identify stress triggers and effective ways to manage them in your daily life.',
      category: 'stress',
      categoryLabel: 'Stress Management',
      readTime: '5 min read',
      icon: '🧘'
    },
    {
      id: 2,
      title: 'The Science of Sleep: Optimizing Your Rest',
      description: 'Evidence-based tips for improving sleep quality and establishing healthy sleep routines.',
      category: 'sleep',
      categoryLabel: 'Sleep',
      readTime: '7 min read',
      icon: '💤'
    },
    {
      id: 3,
      title: 'Building Sustainable Fitness Habits',
      description: 'Start small and build lasting exercise habits that fit your lifestyle, not the other way around.',
      category: 'fitness',
      categoryLabel: 'Fitness',
      readTime: '6 min read',
      icon: '🏃'
    },
    {
      id: 4,
      title: 'Energy Management Throughout the Day',
      description: 'Understand your energy patterns and schedule demanding tasks during your peak performance hours.',
      category: 'energy',
      categoryLabel: 'Energy',
      readTime: '4 min read',
      icon: '⚡'
    },
    {
      id: 5,
      title: 'Mindfulness for Busy Professionals',
      description: 'Simple mindfulness techniques that take under 5 minutes and fit into any schedule.',
      category: 'stress',
      categoryLabel: 'Stress Management',
      readTime: '5 min read',
      icon: '🧠'
    }
  ],

  init() {
    this._renderArticles();
  },

  _renderArticles() {
    const container = document.getElementById('blog-articles');
    if (!container) return;

    container.innerHTML = this.articles.map(article => `
      <article class="blog-card" data-category="${article.category}">
        <div class="blog-card-header">
          <span class="blog-icon">${article.icon}</span>
          <span class="blog-category">${article.categoryLabel}</span>
        </div>
        <h3 class="blog-title">${article.title}</h3>
        <p class="blog-description">${article.description}</p>
        <div class="blog-card-footer">
          <span class="blog-read-time">${article.readTime}</span>
          <button class="btn-ghost btn-small">Read More</button>
        </div>
      </article>
    `).join('');
  },

  filterByCategory(category) {
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
};