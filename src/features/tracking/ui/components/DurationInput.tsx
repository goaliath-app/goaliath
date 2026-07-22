import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  padDurationField,
  parseDurationField,
  partsToSeconds,
  secondsToParts,
  type DurationUnit,
} from '../format/duration';

const UNITS = [
  { unit: 'hours', labelKey: 'duration.hoursLabel' },
  { unit: 'minutes', labelKey: 'duration.minutesLabel' },
  { unit: 'seconds', labelKey: 'duration.secondsLabel' },
] as const satisfies readonly { unit: DurationUnit; labelKey: string }[];

export interface DurationInputProps {
  /** The duration, in seconds — the unit the domain stores. */
  value: number;
  onValueChange: (seconds: number) => void;
  /**
   * Upper bound for the hours field. A day target can't sensibly exceed a day;
   * a weekly quota can, hence the caller decides.
   */
  maxHours?: number;
}

/**
 * An `hh:mm:ss` duration field: three number pads with a colon between them,
 * the same shape legacy/v1 used, because typing "20" and "00" is far easier
 * than working out that 20 minutes is 1200 seconds.
 *
 * The value in and out is **always seconds**; the split into parts exists only
 * inside this component. Each field is clamped as it is typed
 * (`parseDurationField`), so no keystroke can produce a duration the model
 * can't hold, and blurring an empty field shows `00` rather than nothing.
 */
export function DurationInput({
  value,
  onValueChange,
  maxHours = 23,
}: DurationInputProps) {
  const { t } = useTranslation('activityForm');
  const [focused, setFocused] = useState<DurationUnit | null>(null);
  const parts = secondsToParts(value);

  return (
    <View style={styles.row}>
      {UNITS.map(({ unit, labelKey }, index) => (
        <View key={unit} style={styles.field}>
          {index > 0 ? <Text style={styles.colon}>:</Text> : null}
          <View>
            <TextInput
              style={styles.input}
              // Unpadded while focused so the caret isn't fighting a leading
              // zero; padded once the user leaves, for the clock-face look.
              value={
                focused === unit
                  ? String(parts[unit])
                  : padDurationField(parts[unit])
              }
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              onFocus={() => setFocused(unit)}
              onBlur={() => setFocused((current) => (current === unit ? null : current))}
              onChangeText={(raw) =>
                onValueChange(
                  partsToSeconds({
                    ...parts,
                    [unit]: parseDurationField(raw, unit, maxHours),
                  }),
                )
              }
              accessibilityLabel={t(labelKey)}
            />
            <Text style={styles.unitLabel}>{t(labelKey)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  field: { flexDirection: 'row', alignItems: 'flex-start' },
  colon: { fontSize: 28, lineHeight: 46, marginHorizontal: 6, color: '#8a8a8e' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 22,
    minWidth: 62,
    textAlign: 'center',
  },
  unitLabel: {
    fontSize: 12,
    color: '#8a8a8e',
    textAlign: 'center',
    marginTop: 4,
  },
});
