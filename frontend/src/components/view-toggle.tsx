import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';

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
  const styles = makeStyles(useTheme());

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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    backgroundColor: theme.subtle,
    borderRadius: theme.radius.chip,
  },
  option: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.radius.chip,
  },
  optionActive: {
    backgroundColor: theme.ink,
  },
  label: {
    color: theme.muted,
    fontSize: 11.5,
    fontWeight: '700',
  },
  labelActive: {
    color: theme.onDark,
  },
  });
