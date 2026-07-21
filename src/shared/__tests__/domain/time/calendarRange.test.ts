import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import {
  monthRangeOf,
  weekRangeOf,
  yearRangeOf,
} from '@/shared/domain/time/calendarRange';

const day = (value: string): CalendarDay => value as CalendarDay;

const MONDAY = 1;
const SUNDAY = 7;

describe('weekRangeOf', () => {
  // 2024-06-15 is a Saturday; its ISO week runs Mon 10th → Sun 16th.
  it('spans Monday to Sunday when the week starts on Monday', () => {
    expect(weekRangeOf(day('2024-06-15'), MONDAY)).toEqual({
      from: day('2024-06-10'),
      to: day('2024-06-16'),
    });
  });

  it('keeps a day that is itself the week start as the range start', () => {
    expect(weekRangeOf(day('2024-06-10'), MONDAY).from).toBe('2024-06-10');
  });

  it('re-buckets the same day when the week starts on Sunday', () => {
    // Same Saturday, Sunday-start week: Sun 9th → Sat 15th.
    expect(weekRangeOf(day('2024-06-15'), SUNDAY)).toEqual({
      from: day('2024-06-09'),
      to: day('2024-06-15'),
    });
  });

  it('crosses a month boundary correctly', () => {
    // Mon 2024-07-01 belongs to the week starting Mon 2024-07-01.
    expect(weekRangeOf(day('2024-07-03'), MONDAY)).toEqual({
      from: day('2024-07-01'),
      to: day('2024-07-07'),
    });
    // A Monday-start week spanning June→July.
    expect(weekRangeOf(day('2024-06-30'), MONDAY)).toEqual({
      from: day('2024-06-24'),
      to: day('2024-06-30'),
    });
  });

  it('rejects a week start outside the ISO 1..7 range', () => {
    expect(() => weekRangeOf(day('2024-06-15'), 0)).toThrow(RangeError);
    expect(() => weekRangeOf(day('2024-06-15'), 8)).toThrow(RangeError);
  });
});

describe('monthRangeOf', () => {
  it('spans the whole month', () => {
    expect(monthRangeOf(day('2024-06-15'))).toEqual({
      from: day('2024-06-01'),
      to: day('2024-06-30'), // 30-day month
    });
  });

  it('handles a 31-day month', () => {
    expect(monthRangeOf(day('2024-07-04')).to).toBe('2024-07-31');
  });

  it('handles February in a leap year and a common year', () => {
    expect(monthRangeOf(day('2024-02-10')).to).toBe('2024-02-29');
    expect(monthRangeOf(day('2023-02-10')).to).toBe('2023-02-28');
  });

  it('handles December without rolling into the next year', () => {
    expect(monthRangeOf(day('2024-12-05'))).toEqual({
      from: day('2024-12-01'),
      to: day('2024-12-31'),
    });
  });
});

describe('yearRangeOf', () => {
  it('spans January 1st to December 31st', () => {
    expect(yearRangeOf(day('2024-06-15'))).toEqual({
      from: day('2024-01-01'),
      to: day('2024-12-31'),
    });
  });
});

