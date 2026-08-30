import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  text: string;
  bottomOffset: number;
  action?: { label: string; onPress: () => void };
};

/** A pill above the map: either a short status line, or an empty-state prompt. */
export function StatusBarMessage({ text, bottomOffset, action }: Props) {
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

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardText: {
    color: '#1c2024',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e5484d',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
