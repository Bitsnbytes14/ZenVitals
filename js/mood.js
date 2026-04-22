// mood.js — ZenVitals check-in & form logic

const Mood = {
  selectedMood: null,
  currentValues: {
    energy: 5,
    stress: 5,
    sleepHours: 7,
    activity: 5,
    mood: null,
    reflection: '',
  },

  init() {
    this._bindMoodCards();
    this._bindSliders();
    this._bindSleepInput();
    this._bindReflection();
    this._bindSubmit();
    this._updateLiveScore();
  },

  _bindMoodCards() {
    document.querySelectorAll('.mood-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedMood = card.dataset.mood;
        this.currentValues.mood = this.selectedMood;
        this._updateLiveScore();
      });
    });
  },

  _bindSliders() {
    const energySlider = document.getElementById('energy-slider');
    const stressSlider = document.getElementById('stress-slider');
    const activitySlider = document.getElementById('activity-slider');

    if (energySlider) {
      energySlider.addEventListener('input', (e) => {
        document.getElementById('energy-val').textContent = e.target.value;
        this.currentValues.energy = Number(e.target.value);
        this._updateSliderFill(e.target);
        this._updateLiveScore();
      });
      this._updateSliderFill(energySlider);
    }

    if (stressSlider) {
      stressSlider.addEventListener('input', (e) => {
        document.getElementById('stress-val').textContent = e.target.value;
        this.currentValues.stress = Number(e.target.value);
        this._updateSliderFill(e.target);
        this._updateLiveScore();
      });
      this._updateSliderFill(stressSlider);
    }

    if (activitySlider) {
      activitySlider.addEventListener('input', (e) => {
        document.getElementById('activity-val').textContent = e.target.value;
        this.currentValues.activity = Number(e.target.value);
        this._updateSliderFill(e.target);
        this._updateLiveScore();
      });
      this._updateSliderFill(activitySlider);
    }
  },

  _updateSliderFill(slider) {
    const min = slider.min || 0;
    const max = slider.max || 10;
    const val = slider.value;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', `${pct}%`);
  },

  _bindSleepInput() {
    const sleepInput = document.getElementById('sleep-input');
    if (!sleepInput) return;
    sleepInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      this.currentValues.sleepHours = val;
      this._updateLiveScore();
    });
  },

  _bindReflection() {
    const ref = document.getElementById('reflection-input');
    if (!ref) return;
    ref.addEventListener('input', (e) => {
      this.currentValues.reflection = e.target.value;
      const count = document.getElementById('char-count');
      if (count) count.textContent = e.target.value.length;
    });
  },

  _updateLiveScore() {
    const preview = document.getElementById('score-preview');
    if (!preview) return;
    if (!this.currentValues.mood) {
      preview.textContent = '--';
      return;
    }
    const score = Logic.calculateScore(this.currentValues);
    preview.textContent = score;
    const label = Logic.getScoreLabel(score);
    document.getElementById('score-preview-label').textContent = label.label;
    preview.style.color = label.color;
  },

  _bindSubmit() {
    const btn = document.getElementById('submit-checkin');
    if (!btn) return;
    btn.addEventListener('click', () => this.submit());
  },

  submit() {
    if (!this.currentValues.mood) {
      this._showError('Please select your mood to continue.');
      return;
    }
    if (!this.currentValues.sleepHours || this.currentValues.sleepHours < 0) {
      this._showError('Please enter your sleep hours.');
      return;
    }

    const score = Logic.calculateScore(this.currentValues);
    const categories = Logic.getCategoryScores(this.currentValues);
    const entry = {
      ...this.currentValues,
      score,
      categories,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };

    AppStorage.saveCheckIn(entry);
    this._showSuccess(score);
    Dashboard.refresh();
  },

  _showError(msg) {
    const el = document.getElementById('checkin-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => (el.style.display = 'none'), 3000);
  },

  _showSuccess(score) {
    const modal = document.getElementById('success-modal');
    const scoreEl = document.getElementById('modal-score');
    if (!modal) return;
    if (scoreEl) scoreEl.textContent = score;
    modal.classList.add('visible');
    // Reset form
    setTimeout(() => {
      modal.classList.remove('visible');
      Navigation.switchTo('dashboard');
    }, 2500);
  },
};
