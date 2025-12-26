import { CountdownTimer } from './countdown.js';
import { TimezoneManager } from './timezone.js';
import { ThemeManager, PreferencesManager } from './theme.js';
import { FireworksAnimation } from './fireworks.js';

class CountdownApp {
  constructor() {
    this.countdown = new CountdownTimer();
    this.timezoneManager = new TimezoneManager();
    this.themeManager = new ThemeManager();
    this.fireworks = new FireworksAnimation('fireworks-canvas');

    this.elements = {
      days: document.getElementById('days'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds'),
      timezoneDisplay: document.getElementById('timezone-display'),
      timezoneSelect: document.getElementById('timezone-select'),
      themeSelect: document.getElementById('theme-select'),
      countdownSection: document.getElementById('countdown-section'),
      celebrationSection: document.getElementById('celebration-section')
    };

    this.hasReachedNewYear = false;

    this.init();
  }

  init() {
    this.loadPreferences();
    this.setupEventListeners();
    this.setupCountdownCallbacks();
    this.countdown.start();
  }

  loadPreferences() {
    const savedTimezone = PreferencesManager.loadTimezone();
    const savedTheme = this.themeManager.getTheme();

    this.timezoneManager.setTimezone(savedTimezone);
    this.countdown.setTimezone(savedTimezone);
    this.elements.timezoneSelect.value = savedTimezone;
    this.elements.themeSelect.value = savedTheme;

    this.updateTimezoneDisplay();
  }

  setupEventListeners() {
    this.elements.timezoneSelect.addEventListener('change', (e) => {
      this.handleTimezoneChange(e.target.value);
    });

    this.elements.themeSelect.addEventListener('change', (e) => {
      this.handleThemeChange(e.target.value);
    });
  }

  setupCountdownCallbacks() {
    this.countdown.onTick = (timeRemaining) => {
      this.updateDisplay(timeRemaining);
    };

    this.countdown.onCountdownEnd = () => {
      this.handleNewYear();
    };
  }

  handleTimezoneChange(timezone) {
    this.timezoneManager.setTimezone(timezone);
    this.countdown.setTimezone(timezone);
    PreferencesManager.saveTimezone(timezone);
    this.updateTimezoneDisplay();
    this.countdown.reset();
    this.countdown.start();
  }

  handleThemeChange(theme) {
    this.themeManager.setTheme(theme);
  }

  updateTimezoneDisplay() {
    const label = this.timezoneManager.getTimezoneLabel(
      this.timezoneManager.getTimezone()
    );
    this.elements.timezoneDisplay.textContent = label;
  }

  updateDisplay(timeRemaining) {
    this.elements.days.textContent = this.countdown.formatTimeUnit(timeRemaining.days);
    this.elements.hours.textContent = this.countdown.formatTimeUnit(timeRemaining.hours);
    this.elements.minutes.textContent = this.countdown.formatTimeUnit(timeRemaining.minutes);
    this.elements.seconds.textContent = this.countdown.formatTimeUnit(timeRemaining.seconds);
  }

  handleNewYear() {
    if (this.hasReachedNewYear) return;

    this.hasReachedNewYear = true;

    this.elements.countdownSection.classList.add('fade-out');

    setTimeout(() => {
      this.elements.countdownSection.style.display = 'none';

      this.elements.celebrationSection.classList.remove('hidden');

      setTimeout(() => {
        this.elements.celebrationSection.classList.add('active');
      }, 50);

      this.fireworks.start();
    }, 600);
  }

  destroy() {
    this.countdown.stop();
    this.fireworks.cleanup();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new CountdownApp();

  window.addEventListener('beforeunload', () => {
    app.destroy();
  });
});
