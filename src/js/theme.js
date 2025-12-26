const STORAGE_KEYS = {
  THEME: 'countdown-theme',
  TIMEZONE: 'countdown-timezone'
};

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      return savedTheme || 'dark-gold';
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return 'dark-gold';
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    this.saveTheme(theme);
  }

  setTheme(theme) {
    this.applyTheme(theme);
  }

  getTheme() {
    return this.currentTheme;
  }
}

export class PreferencesManager {
  static saveTimezone(timezone) {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMEZONE, timezone);
    } catch (error) {
      console.warn('Failed to save timezone to localStorage:', error);
    }
  }

  static loadTimezone() {
    try {
      return localStorage.getItem(STORAGE_KEYS.TIMEZONE) || 'local';
    } catch (error) {
      console.warn('Failed to load timezone from localStorage:', error);
      return 'local';
    }
  }
}
