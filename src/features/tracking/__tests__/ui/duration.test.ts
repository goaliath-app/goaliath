import {
  formatDurationWords,
  maxValueFor,
  padDurationField,
  parseDurationField,
  partsToSeconds,
  secondsToParts,
  type Translate,
} from '../../ui/format/duration';

/** Just enough Spanish to check the words read right. */
const spanish: Translate = (key, options) => {
  const strings: Record<string, string> = {
    'duration.hoursShort': '{{count}} h',
    'duration.minutesShort': '{{count}} min',
    'duration.secondsShort': '{{count}} s',
    'duration.partSeparator': ' ',
  };
  const template = strings[key] ?? `[${key}]`;
  return Object.entries(options ?? {}).reduce(
    (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
    template,
  );
};

describe('secondsToParts', () => {
  it('splits a duration into hours, minutes and seconds', () => {
    expect(secondsToParts(5445)).toEqual({ hours: 1, minutes: 30, seconds: 45 });
  });

  it('reports zero for an empty duration', () => {
    expect(secondsToParts(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it('floors a fractional value instead of rounding up past it', () => {
    expect(secondsToParts(59.9)).toEqual({ hours: 0, minutes: 0, seconds: 59 });
  });

  it('treats a negative duration as empty rather than producing negative parts', () => {
    expect(secondsToParts(-10)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('partsToSeconds', () => {
  it('is the inverse of secondsToParts', () => {
    for (const total of [0, 1, 59, 60, 3599, 3600, 5445, 86399]) {
      expect(partsToSeconds(secondsToParts(total))).toBe(total);
    }
  });
});

describe('parseDurationField', () => {
  it('reads the digits the user typed', () => {
    expect(parseDurationField('45', 'seconds', 23)).toBe(45);
  });

  it('treats an emptied field as zero', () => {
    expect(parseDurationField('', 'minutes', 23)).toBe(0);
  });

  it('drops anything that is not a digit', () => {
    expect(parseDurationField('4a5', 'seconds', 23)).toBe(45);
  });

  it('clamps minutes and seconds at 59 rather than carrying into the next unit', () => {
    expect(parseDurationField('90', 'minutes', 23)).toBe(59);
    expect(parseDurationField('99', 'seconds', 23)).toBe(59);
  });

  it('clamps hours at the caller-supplied maximum', () => {
    expect(parseDurationField('40', 'hours', 23)).toBe(23);
    expect(parseDurationField('40', 'hours', 99)).toBe(40);
  });
});

describe('maxValueFor', () => {
  it('caps hours by the argument and the rest at 59', () => {
    expect(maxValueFor('hours', 99)).toBe(99);
    expect(maxValueFor('minutes', 99)).toBe(59);
    expect(maxValueFor('seconds', 99)).toBe(59);
  });
});

describe('padDurationField', () => {
  it('pads a single digit to the two-digit clock look', () => {
    expect(padDurationField(7)).toBe('07');
    expect(padDurationField(45)).toBe('45');
  });
});

describe('formatDurationWords', () => {
  it('names every non-zero part', () => {
    expect(formatDurationWords(5445, spanish)).toBe('1 h 30 min 45 s');
  });

  it('omits the parts that are zero', () => {
    expect(formatDurationWords(7200, spanish)).toBe('2 h');
    expect(formatDurationWords(1200, spanish)).toBe('20 min');
    expect(formatDurationWords(5400, spanish)).toBe('1 h 30 min');
  });

  it('falls back to seconds for an empty duration, rather than to nothing', () => {
    expect(formatDurationWords(0, spanish)).toBe('0 s');
  });
});
