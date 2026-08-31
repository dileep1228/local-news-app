import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';

type Props = {
  text: string;
  bottomOffset: number;
  action?: { label: string; onPress: () => void };
};

/** A pill above the map: either a short status line, or an empty-state prompt. */
export function StatusBarMessage({ text, bottomOffset, action }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);

  if (action) {
    return (
      <View style={[styles.card, { bottom: bottomOffset }]}>
        <Text style={styles.cardText}>{text}</Text>
        <Pressable style={styles.button} onPress={action.onPress}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.pill, { bottom: bottomOffset }]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: theme.onAccent,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: theme.paper,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 12,
    shadowColor: theme.ink,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.ink,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  buttonText: {
    color: theme.onAccent,
    fontSize: 15,
    fontWeight: '700',
  },
  });
