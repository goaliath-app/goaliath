import {
  addRepetition,
  countRepetitions,
  emptyCounterProgress,
  isCounterComplete,
} from '@/features/tracking/domain/activityTypes/counter';

describe('counter progress', () => {
  it('starts with no repetitions', () => {
    expect(countRepetitions(emptyCounterProgress())).toBe(0);
  });

  it('appends a repetition without mutating the previous progress', () => {
    const before = emptyCounterProgress();
    const after = addRepetition(before, new Date('2024-06-15T07:30:00Z'));

    expect(countRepetitions(after)).toBe(1);
    expect(countRepetitions(before)).toBe(0); // unchanged
    expect(after.repetitions[0].at).toBe('2024-06-15T07:30:00.000Z');
  });

  it('accumulates repetitions in order', () => {
    let progress = emptyCounterProgress();
    progress = addRepetition(progress, new Date('2024-06-15T07:00:00Z'));
    progress = addRepetition(progress, new Date('2024-06-15T19:00:00Z'));
    expect(progress.repetitions.map((rep) => rep.at)).toEqual([
      '2024-06-15T07:00:00.000Z',
      '2024-06-15T19:00:00.000Z',
    ]);
  });
});

describe('isCounterComplete', () => {
  const withReps = (count: number) => ({
    repetitions: Array.from({ length: count }, (_unused, index) => ({
      at: `2024-06-15T0${index}:00:00.000Z`,
    })),
  });

  it('is complete once the rep count reaches a numeric dayGoal', () => {
    expect(isCounterComplete(withReps(2), 3)).toBe(false);
    expect(isCounterComplete(withReps(3), 3)).toBe(true);
    expect(isCounterComplete(withReps(4), 3)).toBe(true);
  });

  it('treats a null dayGoal as the binary "did it" — at least one rep', () => {
    expect(isCounterComplete(withReps(0), null)).toBe(false);
    expect(isCounterComplete(withReps(1), null)).toBe(true);
  });
});
