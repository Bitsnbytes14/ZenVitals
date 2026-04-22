// booking.js — ZenVitals Appointment Booking Module

const Booking = {
  KEY: 'zv_bookings',

  init() {
    this._bindForm();
    this._loadBookings();
  },

  _bindForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });
  },

  _handleSubmit() {
    const name = document.getElementById('booking-name')?.value.trim();
    const email = document.getElementById('booking-email')?.value.trim();
    const date = document.getElementById('booking-date')?.value;
    const time = document.getElementById('booking-time')?.value;

    if (!name || !email || !date || !time) {
      this._showError('Please fill in all fields.');
      return;
    }

    if (!this._validateEmail(email)) {
      this._showError('Please enter a valid email address.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      this._showError('Please select a future date.');
      return;
    }

    const booking = {
      id: Date.now(),
      name,
      email,
      date,
      time,
      createdAt: new Date().toISOString()
    };

    const bookings = this._getBookings();
    bookings.push(booking);
    AppStorage.save(this.KEY, bookings);

    this._showSuccess('Appointment booked successfully!');
    document.getElementById('booking-form')?.reset();
    this._loadBookings();
  },

  _getBookings() {
    return AppStorage.load(this.KEY) || [];
  },

  _loadBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;

    const bookings = this._getBookings();
    if (bookings.length === 0) {
      container.innerHTML = '<p class="empty-text">No appointments yet.</p>';
      return;
    }

    const sorted = [...bookings].reverse().slice(0, 5);
    container.innerHTML = sorted.map(b => `
      <div class="booking-card">
        <div class="booking-info">
          <strong>${b.name}</strong>
          <span>${b.email}</span>
        </div>
        <div class="booking-datetime">
          <span class="booking-date">${b.date}</span>
          <span class="booking-time">${b.time}</span>
        </div>
        <button class="btn-danger btn-small" onclick="Booking._cancelBooking(${b.id})">Cancel</button>
      </div>
    `).join('');
  },

  _cancelBooking(id) {
    if (!confirm('Cancel this appointment?')) return;
    const bookings = this._getBookings().filter(b => b.id !== id);
    AppStorage.save(this.KEY, bookings);
    this._loadBookings();
  },

  _validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  _showError(msg) {
    const el = document.getElementById('booking-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => (el.style.display = 'none'), 4000);
  },

  _showSuccess(msg) {
    const el = document.getElementById('booking-success');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => (el.style.display = 'none'), 4000);
  }
};