import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { RADIUS_OPTIONS } from '@/constants/config';

type Props = {
  selectedIndex: number;
  topOffset: number;
  onSelect: (index: number) => void;
};

/** Horizontal chips for choosing the search radius. */
export function RadiusSelector({ selectedIndex, topOffset, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.bar, { top: topOffset }]}
      contentContainerStyle={styles.content}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    maxHeight: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  content: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 5,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: '#1c2024',
  },
  chipText: {
    color: '#60646c',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
