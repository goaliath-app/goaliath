import { countsAsDone } from '@/features/tracking/domain/occurrenceStatusPolicy';

describe('occurrenceStatusPolicy.countsAsDone', () => {
  it('counts a done day as done', () => {
    expect(countsAsDone('done')).toBe(true);
  });

  it('does not count a pending day as done', () => {
    expect(countsAsDone('pending')).toBe(false);
  });
});
