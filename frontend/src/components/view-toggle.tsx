import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/constants/palette';

export type ViewMode = 'map' | 'list';

type Props = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

/**
 * Switches between the map-with-sheet view and the ranked list. Sits inline in
 * whichever header is showing, so it costs the map no space of its own.
 */
export function ViewToggle({ mode, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {(['map', 'list'] as const).map((option) => {
        const active = option === mode;

        return (
          <Pressable
            key={option}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(option)}
            hitSlop={6}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option === 'map' ? 'Map' : 'List'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    backgroundColor: palette.subtle,
    borderRadius: 14,
  },
  option: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  optionActive: {
    backgroundColor: palette.ink,
  },
  label: {
    color: palette.muted,
    fontSize: 11.5,
    fontWeight: '700',
  },
  labelActive: {
    color: palette.onDark,
  },
});
