import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS_OPTIONS } from '@/constants/config';
import { palette } from '@/constants/palette';

type Props = {
  selectedIndex: number;
  topOffset: number;
  onSelect: (index: number) => void;
};

/** Chips for choosing the search radius. Kept to five so they fit without scrolling. */
export function RadiusSelector({ selectedIndex, topOffset, onSelect }: Props) {
  return (
    <View style={[styles.bar, { top: topOffset }]}>
      {RADIUS_OPTIONS.map((option, index) => {
        const active = index === selectedIndex;

        return (
          <Pressable
            key={option.metres}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(index)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 5,
    backgroundColor: palette.paper,
    borderRadius: 22,
    shadowColor: palette.ink,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: palette.ink,
  },
  chipText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: palette.onDark,
  },
});
