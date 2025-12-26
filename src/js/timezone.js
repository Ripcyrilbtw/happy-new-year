export class TimezoneManager {
  constructor() {
    this.currentTimezone = 'local';
  }

  getTimezoneLabel(timezone) {
    if (timezone === 'local') {
      return 'Your Local Time';
    }

    if (timezone === 'UTC') {
      return 'UTC (Coordinated Universal Time)';
    }

    const timezoneNames = {
      'America/New_York': 'New York',
      'America/Los_Angeles': 'Los Angeles',
      'Europe/London': 'London',
      'Europe/Paris': 'Paris',
      'Asia/Kolkata': 'India',
      'Asia/Tokyo': 'Tokyo',
      'Asia/Dubai': 'Dubai',
      'Australia/Sydney': 'Sydney'
    };

    const name = timezoneNames[timezone] || timezone;
    const offset = this.getTimezoneOffsetString(timezone);

    return `${name} (${offset})`;
  }

  getTimezoneOffsetString(timezone) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      });

      const parts = formatter.formatToParts(now);
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');

      if (timeZonePart) {
        return timeZonePart.value;
      }

      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (tzDate.getTime() - utcDate.getTime()) / 60000;

      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';

      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'UTC';
    }
  }

  setTimezone(timezone) {
    this.currentTimezone = timezone;
  }

  getTimezone() {
    return this.currentTimezone;
  }

  isValidTimezone(timezone) {
    if (timezone === 'local' || timezone === 'UTC') {
      return true;
    }

    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }
}
