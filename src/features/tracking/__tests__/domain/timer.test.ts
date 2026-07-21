import {
  appendInterval,
  emptyTimerProgress,
  isTimerComplete,
  totalSeconds,
  type TimerProgress,
} from '@/features/tracking/domain/activityTypes/timer';

const at = (iso: string) => new Date(iso);

describe('timer progress', () => {
  it('starts with no time logged', () => {
    expect(totalSeconds(emptyTimerProgress())).toBe(0);
  });

  it('appends a closed interval without mutating the previous progress', () => {
    const before = emptyTimerProgress();
    const after = appendInterval(
      before,
      at('2024-06-15T07:00:00Z'),
      at('2024-06-15T07:10:00Z'),
    );

    expect(after.intervals).toEqual([
      { start: '2024-06-15T07:00:00.000Z', end: '2024-06-15T07:10:00.000Z' },
    ]);
    expect(before.intervals).toHaveLength(0); // unchanged
  });

  it('sums seconds across several intervals', () => {
    let progress = emptyTimerProgress();
    progress = appendInterval(
      progress,
      at('2024-06-15T07:00:00Z'),
      at('2024-06-15T07:10:00Z'), // 600s
    );
    progress = appendInterval(
      progress,
      at('2024-06-15T19:00:00Z'),
      at('2024-06-15T19:05:30Z'), // 330s
    );
    expect(totalSeconds(progress)).toBe(930);
  });

  it('floors partial seconds so they never round a day up into complete', () => {
    const progress = appendInterval(
      emptyTimerProgress(),
      at('2024-06-15T07:00:00.000Z'),
      at('2024-06-15T07:00:09.900Z'), // 9.9s
    );
    expect(totalSeconds(progress)).toBe(9);
  });

  it('rejects an interval that ends before it starts', () => {
    expect(() =>
      appendInterval(
        emptyTimerProgress(),
        at('2024-06-15T08:00:00Z'),
        at('2024-06-15T07:00:00Z'),
      ),
    ).toThrow(RangeError);
  });
});

describe('isTimerComplete', () => {
  const loggedSeconds = (seconds: number): TimerProgress =>
    appendInterval(
      emptyTimerProgress(),
      at('2024-06-15T07:00:00Z'),
      new Date(Date.parse('2024-06-15T07:00:00Z') + seconds * 1000),
    );

  it('is complete once the logged seconds reach a numeric dayGoal', () => {
    expect(isTimerComplete(loggedSeconds(1199), 1200)).toBe(false);
    expect(isTimerComplete(loggedSeconds(1200), 1200)).toBe(true);
    expect(isTimerComplete(loggedSeconds(1800), 1200)).toBe(true);
  });

  it('treats a null dayGoal as the binary "did it" — any time at all', () => {
    expect(isTimerComplete(emptyTimerProgress(), null)).toBe(false);
    expect(isTimerComplete(loggedSeconds(1), null)).toBe(true);
  });
});
