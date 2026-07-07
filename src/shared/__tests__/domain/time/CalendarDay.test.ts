import { getCalendarDay } from '@/shared/domain/time/CalendarDay';

describe('getCalendarDay', () => {
  it('returns the calendar date when the day starts at midnight', () => {
    const instant = new Date(2024, 0, 15, 10, 30); // Jan 15 2024, 10:30 local
    expect(getCalendarDay(instant, 0)).toBe('2024-01-15');
  });

  it('assigns instants before dayStartHour to the previous logical day', () => {
    const instant = new Date(2024, 0, 15, 2, 0); // 02:00 with a 04:00 cutoff
    expect(getCalendarDay(instant, 4)).toBe('2024-01-14');
  });

  it('assigns an instant exactly at dayStartHour to the same day', () => {
    const instant = new Date(2024, 0, 15, 4, 0); // 04:00 with a 04:00 cutoff
    expect(getCalendarDay(instant, 4)).toBe('2024-01-15');
  });

  it('zero-pads single-digit months and days', () => {
    const instant = new Date(2024, 2, 5, 12, 0); // Mar 5 2024
    expect(getCalendarDay(instant, 0)).toBe('2024-03-05');
  });

  it('crosses the month boundary correctly with a cutoff', () => {
    const instant = new Date(2024, 2, 1, 1, 0); // Mar 1, 01:00 with a 04:00 cutoff
    expect(getCalendarDay(instant, 4)).toBe('2024-02-29'); // leap year
  });

  it('produces strings whose lexicographic order is chronological order', () => {
    const earlier = getCalendarDay(new Date(2024, 0, 14, 12), 0);
    const later = getCalendarDay(new Date(2024, 0, 15, 12), 0);
    expect(earlier < later).toBe(true);
  });
});
