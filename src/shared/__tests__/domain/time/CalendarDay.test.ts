import {
  calendarDayParts,
  getCalendarDay,
  isoWeekday,
  type CalendarDay,
} from '@/shared/domain/time/CalendarDay';

// The DST tests below need a zone that actually observes daylight saving, so the
// result never depends on the CI machine's timezone. Europe/Madrid springs
// forward on 2024-03-31 (02:00 -> 03:00, a 23-hour day). Set before any Date is
// built in the test bodies; the day computation is local-component based, so
// pinning this makes every case in this file deterministic without changing the
// non-DST expectations.
process.env.TZ = 'Europe/Madrid';

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

  describe('edge cutoff hours', () => {
    it('treats dayStartHour = 0 as the plain calendar day, even at 00:00', () => {
      expect(getCalendarDay(new Date(2024, 0, 15, 0, 0), 0)).toBe('2024-01-15');
      expect(getCalendarDay(new Date(2024, 0, 15, 23, 59), 0)).toBe('2024-01-15');
    });

    it('with dayStartHour = 23, only 23:00-23:59 counts as the new day', () => {
      // 22:59 is still the previous logical day...
      expect(getCalendarDay(new Date(2024, 0, 15, 22, 59), 23)).toBe(
        '2024-01-14',
      );
      // ...and 23:00 flips to the current one.
      expect(getCalendarDay(new Date(2024, 0, 15, 23, 0), 23)).toBe('2024-01-15');
    });
  });

  describe('daylight saving transitions (TZ pinned to Europe/Madrid)', () => {
    it('does not mislabel the day when the spring-forward hour is lost', () => {
      // 2024-03-31 04:30 local: the clock jumped 02:00 -> 03:00 that morning, so
      // this day is only 23 hours long. 04:30 >= 04:00, so it must be *today*.
      // Absolute-millisecond subtraction would wrongly return 2024-03-30.
      const afterCutoffOnDstDay = new Date(2024, 2, 31, 4, 30);
      expect(getCalendarDay(afterCutoffOnDstDay, 4)).toBe('2024-03-31');
    });

    it('still assigns pre-cutoff instants on a DST day to the previous day', () => {
      const beforeCutoffOnDstDay = new Date(2024, 2, 31, 1, 30); // 01:30, cutoff 4
      expect(getCalendarDay(beforeCutoffOnDstDay, 4)).toBe('2024-03-30');
    });

    it('handles the autumn fall-back day (25-hour day) correctly', () => {
      // 2024-10-27 03:00 local: the clock fell back 03:00 -> 02:00 that morning.
      const afterCutoff = new Date(2024, 9, 27, 3, 0);
      expect(getCalendarDay(afterCutoff, 4)).toBe('2024-10-26'); // 3 < 4 -> prev
      expect(getCalendarDay(new Date(2024, 9, 27, 5, 0), 4)).toBe('2024-10-27');
    });
  });

  describe('validation', () => {
    it.each([-1, 24, 3.5, NaN])(
      'throws a RangeError for an out-of-range dayStartHour (%p)',
      (invalid) => {
        expect(() => getCalendarDay(new Date(2024, 0, 15, 12), invalid)).toThrow(
          RangeError,
        );
      },
    );
  });
});

const day = (value: string): CalendarDay => value as CalendarDay;

describe('calendarDayParts', () => {
  it('splits a logical day into numeric parts (month 1..12)', () => {
    expect(calendarDayParts(day('2024-03-05'))).toEqual({
      year: 2024,
      month: 3,
      day: 5,
    });
  });
});

describe('isoWeekday', () => {
  it('uses ISO numbering: Monday is 1', () => {
    expect(isoWeekday(day('2024-01-15'))).toBe(1); // Mon
  });

  it('maps Sunday to 7, not 0', () => {
    expect(isoWeekday(day('2024-01-14'))).toBe(7); // Sun
  });

  it('covers the rest of the week', () => {
    expect(isoWeekday(day('2024-01-16'))).toBe(2); // Tue
    expect(isoWeekday(day('2024-01-20'))).toBe(6); // Sat
  });
});
