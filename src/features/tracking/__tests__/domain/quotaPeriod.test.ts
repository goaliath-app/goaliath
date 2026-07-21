import { quotaPeriodRangeOf } from '@/features/tracking/domain/quotaPeriod';
import type { CalendarDay } from '@/shared/domain/time/CalendarDay';

const day = (value: string): CalendarDay => value as CalendarDay;
const MONDAY = 1;
const SUNDAY = 7;

describe('quotaPeriodRangeOf', () => {
  // 2024-06-15 is a Saturday.
  const saturday = day('2024-06-15');

  it('maps a weekly quota to its week, honouring the week start', () => {
    expect(quotaPeriodRangeOf(saturday, 'week', MONDAY)).toEqual({
      from: day('2024-06-10'),
      to: day('2024-06-16'),
    });
    expect(quotaPeriodRangeOf(saturday, 'week', SUNDAY)).toEqual({
      from: day('2024-06-09'),
      to: day('2024-06-15'),
    });
  });

  it('maps a monthly quota to its calendar month', () => {
    expect(quotaPeriodRangeOf(saturday, 'month', MONDAY)).toEqual({
      from: day('2024-06-01'),
      to: day('2024-06-30'),
    });
  });

  it('maps a yearly quota to its calendar year', () => {
    expect(quotaPeriodRangeOf(saturday, 'year', MONDAY)).toEqual({
      from: day('2024-01-01'),
      to: day('2024-12-31'),
    });
  });

  it('ignores weekStart for month and year (boundary-independent periods)', () => {
    expect(quotaPeriodRangeOf(saturday, 'month', MONDAY)).toEqual(
      quotaPeriodRangeOf(saturday, 'month', SUNDAY),
    );
    expect(quotaPeriodRangeOf(saturday, 'year', MONDAY)).toEqual(
      quotaPeriodRangeOf(saturday, 'year', SUNDAY),
    );
  });
});
