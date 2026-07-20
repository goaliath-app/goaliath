import {
  isDueOn,
  isFixed,
  type FixedRecurrenceRule,
  type RecurrenceRule,
} from '@/features/tracking/domain/RecurrenceRule';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const day = (value: string): CalendarDay => value as CalendarDay;

describe('isFixed', () => {
  it('narrows every fixed kind to true', () => {
    const fixed: RecurrenceRule[] = [
      { kind: 'daily' },
      { kind: 'weekly', daysOfWeek: [1] },
      { kind: 'monthly', daysOfMonth: [1] },
      { kind: 'yearly', datesOfYear: [{ month: 1, day: 1 }] },
    ];
    for (const rule of fixed) expect(isFixed(rule)).toBe(true);
  });

  it('rejects quota', () => {
    expect(isFixed({ kind: 'quota', period: 'week' })).toBe(false);
  });
});

describe('isDueOn', () => {
  describe('daily', () => {
    it('is due every day', () => {
      const rule: FixedRecurrenceRule = { kind: 'daily' };
      expect(isDueOn(rule, day('2024-01-15'))).toBe(true);
      expect(isDueOn(rule, day('2024-02-29'))).toBe(true);
    });
  });

  describe('weekly', () => {
    const rule: FixedRecurrenceRule = { kind: 'weekly', daysOfWeek: [1, 3, 5] };

    it('is due on the listed ISO weekdays (Mon/Wed/Fri)', () => {
      expect(isDueOn(rule, day('2024-01-15'))).toBe(true); // Mon
      expect(isDueOn(rule, day('2024-01-17'))).toBe(true); // Wed
      expect(isDueOn(rule, day('2024-01-19'))).toBe(true); // Fri
    });

    it('is not due on the other weekdays', () => {
      expect(isDueOn(rule, day('2024-01-16'))).toBe(false); // Tue
      expect(isDueOn(rule, day('2024-01-14'))).toBe(false); // Sun
    });
  });

  describe('monthly', () => {
    const rule: FixedRecurrenceRule = { kind: 'monthly', daysOfMonth: [1, 15] };

    it('is due on the listed days of the month', () => {
      expect(isDueOn(rule, day('2024-03-01'))).toBe(true);
      expect(isDueOn(rule, day('2024-03-15'))).toBe(true);
    });

    it('is not due on other days', () => {
      expect(isDueOn(rule, day('2024-03-14'))).toBe(false);
    });

    it('never clamps: the 31st simply does not match in a 30-day month', () => {
      const on31: FixedRecurrenceRule = { kind: 'monthly', daysOfMonth: [31] };
      expect(isDueOn(on31, day('2024-04-30'))).toBe(false); // April has no 31st
      expect(isDueOn(on31, day('2024-05-31'))).toBe(true);
    });
  });

  describe('yearly', () => {
    const rule: FixedRecurrenceRule = {
      kind: 'yearly',
      datesOfYear: [{ month: 12, day: 25 }],
    };

    it('is due on the listed date regardless of year', () => {
      expect(isDueOn(rule, day('2024-12-25'))).toBe(true);
      expect(isDueOn(rule, day('2025-12-25'))).toBe(true);
    });

    it('is not due on other dates', () => {
      expect(isDueOn(rule, day('2024-12-24'))).toBe(false);
    });

    it('never clamps Feb 29 in a common year', () => {
      const leapDay: FixedRecurrenceRule = {
        kind: 'yearly',
        datesOfYear: [{ month: 2, day: 29 }],
      };
      expect(isDueOn(leapDay, day('2024-02-29'))).toBe(true); // leap year
      expect(isDueOn(leapDay, day('2023-02-28'))).toBe(false); // no Feb 29
    });
  });
});
