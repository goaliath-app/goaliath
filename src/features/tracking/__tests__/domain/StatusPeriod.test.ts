import type { CalendarDay } from '@/shared/domain/time/CalendarDay';
import {
  addStatusPeriod,
  activeSince,
  isActiveOn,
  startedOn,
  statusOn,
  type StatusPeriod,
} from '@/features/tracking/domain/StatusPeriod';

const day = (value: string): CalendarDay => value as CalendarDay;

// active since 10-Jan → paused since 01-Mar → active since 01-May (current)
const timeline: StatusPeriod[] = [
  { status: 'active', from: day('2024-01-10') },
  { status: 'paused', from: day('2024-03-01') },
  { status: 'active', from: day('2024-05-01') },
];

describe('addStatusPeriod', () => {
  it('replaces a change already recorded for the same logical day', () => {
    const periods: StatusPeriod[] = [
      { status: 'active', from: day('2024-01-10') },
      { status: 'paused', from: day('2024-03-01') },
    ];

    expect(addStatusPeriod(periods, { status: 'active', from: day('2024-03-01') })).toEqual([
      { status: 'active', from: '2024-01-10' },
      { status: 'active', from: '2024-03-01' },
    ]);
  });

  it('keeps the timeline sorted when adding a change out of order', () => {
    expect(
      addStatusPeriod(timeline, { status: 'paused', from: day('2024-02-01') }),
    ).toEqual([
      { status: 'active', from: '2024-01-10' },
      { status: 'paused', from: '2024-02-01' },
      { status: 'paused', from: '2024-03-01' },
      { status: 'active', from: '2024-05-01' },
    ]);
  });

  it('does not mutate the existing timeline', () => {
    const periods = [...timeline];

    addStatusPeriod(periods, { status: 'paused', from: day('2024-03-01') });

    expect(periods).toEqual(timeline);
  });
});

describe('statusOn / isActiveOn', () => {
  it('returns the status in effect, with `from` inclusive', () => {
    expect(statusOn(timeline, day('2024-01-10'))).toBe('active');
    expect(statusOn(timeline, day('2024-02-15'))).toBe('active');
  });

  it('applies a change on its `from` day (the change day is the new status)', () => {
    expect(statusOn(timeline, day('2024-03-01'))).toBe('paused');
  });

  it('reports paused days as not active', () => {
    expect(isActiveOn(timeline, day('2024-04-01'))).toBe(false);
  });

  it('carries the last status forward indefinitely', () => {
    expect(isActiveOn(timeline, day('2024-12-31'))).toBe(true);
  });

  it('returns null before the entity existed (distinct from paused)', () => {
    expect(statusOn(timeline, day('2023-12-31'))).toBeNull();
    expect(isActiveOn(timeline, day('2023-12-31'))).toBe(false);
  });
});

describe('startedOn — "since when do I have this"', () => {
  it('is the earliest `from`, unaffected by pauses/resumes', () => {
    expect(startedOn(timeline)).toBe('2024-01-10');
  });

  it('is null when there are no entries', () => {
    expect(startedOn([])).toBeNull();
  });
});

describe('activeSince — "current active run"', () => {
  it('is the `from` of the current status when active', () => {
    expect(activeSince(timeline)).toBe('2024-05-01');
  });

  it('is null when the entity is currently paused', () => {
    const currentlyPaused: StatusPeriod[] = [
      { status: 'active', from: day('2024-01-10') },
      { status: 'paused', from: day('2024-03-01') },
    ];
    expect(activeSince(currentlyPaused)).toBeNull();
  });
});
