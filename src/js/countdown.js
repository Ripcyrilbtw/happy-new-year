export class CountdownTimer {
  constructor(targetYear = 2026) {
    this.targetYear = targetYear;
    this.timezone = 'local';
    this.animationFrameId = null;
    this.onCountdownEnd = null;
    this.onTick = null;
  }

  getNewYearDate() {
    if (this.timezone === 'local') {
      return new Date(this.targetYear, 0, 1, 0, 0, 0, 0);
    } else {
      const dateString = `${this.targetYear}-01-01T00:00:00`;
      return new Date(dateString + (this.timezone === 'UTC' ? 'Z' : ''));
    }
  }

  getCurrentTimeInTimezone() {
    const now = new Date();

    if (this.timezone === 'local') {
      return now;
    }

    if (this.timezone === 'UTC') {
      return new Date(now.toISOString());
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const dateParts = {};

    parts.forEach(({ type, value }) => {
      dateParts[type] = value;
    });

    return new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`
    );
  }

  calculateTimeRemaining() {
    const targetDate = this.getNewYearDate();
    const currentTime = this.getCurrentTimeInTimezone();

    let timeDiff;

    if (this.timezone === 'local') {
      timeDiff = targetDate.getTime() - currentTime.getTime();
    } else {
      const targetUTC = new Date(`${this.targetYear}-01-01T00:00:00${this.timezone === 'UTC' ? 'Z' : ''}`);
      const currentUTC = new Date(currentTime.toISOString());

      if (this.timezone !== 'UTC') {
        const offset = this.getTimezoneOffset(this.timezone, targetUTC);
        targetUTC.setMinutes(targetUTC.getMinutes() - offset);
      }

      timeDiff = targetUTC.getTime() - Date.now();
    }

    if (timeDiff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isComplete: true
      };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isComplete: false
    };
  }

  getTimezoneOffset(timezone, date) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (tzDate.getTime() - utcDate.getTime()) / 60000;
  }

  setTimezone(timezone) {
    this.timezone = timezone;
  }

  formatTimeUnit(value) {
    return value.toString().padStart(2, '0');
  }

  tick() {
    const timeRemaining = this.calculateTimeRemaining();

    if (timeRemaining.isComplete) {
      this.stop();
      if (this.onCountdownEnd) {
        this.onCountdownEnd();
      }
      return;
    }

    if (this.onTick) {
      this.onTick(timeRemaining);
    }

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  start() {
    this.stop();
    this.tick();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  reset() {
    this.stop();
    if (this.onTick) {
      const timeRemaining = this.calculateTimeRemaining();
      this.onTick(timeRemaining);
    }
  }
}
