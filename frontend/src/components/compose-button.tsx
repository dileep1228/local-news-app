import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';

/** Exported so the map can stack the status pill above the button. */
export const COMPOSE_BUTTON_HEIGHT = 46;

type Props = {
  /** Distance from the bottom of the screen, clear of whatever panel is open. */
  bottom: number;
};

/**
 * Posting is the app's one creative action, so it sits on the map itself
 * rather than among the header controls. Right corner: the radius chips are
 * centred at the top and the status pill is centred above the sheet, so the
 * corner is the only place nothing else wants.
 *
 * Round in the themes that round things, square in the ones that do not.
 * Modernist, Instrument and Overprint set every radius to 0 on purpose, down
 * to the pins - a circle there would read as a bug, not a button.
 */
export function ComposeButton({ bottom }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <Pressable
      style={({ pressed }) => [styles.button, { bottom }, pressed && styles.pressed]}
      onPress={() => router.push('/compose')}
      accessibilityRole="button"
      accessibilityLabel="New post"
    >
      <View style={styles.glyph}>
        <View style={styles.bar} />
        <View style={[styles.bar, styles.barVertical]} />
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      right: 16,
      alignItems: 'center',
      justifyContent: 'center',
      width: COMPOSE_BUTTON_HEIGHT,
      height: COMPOSE_BUTTON_HEIGHT,
      backgroundColor: theme.accent,
      borderRadius: theme.radius.button ? COMPOSE_BUTTON_HEIGHT / 2 : 0,
      // Square themes carry their weight in the rule, not in a drop shadow.
      borderWidth: theme.edges.shadow ? 0 : theme.edges.sheetBorderWidth,
      borderColor: theme.edges.sheetBorderColor,
      shadowColor: theme.ink,
      shadowOpacity: theme.edges.shadow ? 0.3 : 0,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: theme.edges.shadow ? 8 : 0,
    },
    pressed: {
      opacity: 0.85,
    },
    /* Two rules rather than a "+" glyph, so the mark is identical in all five
       typefaces - Bricolage and Plex Mono draw very different plus signs. */
    glyph: {
      width: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bar: {
      position: 'absolute',
      width: 18,
      height: 2.5,
      backgroundColor: theme.onAccent,
    },
    barVertical: {
      width: 2.5,
      height: 18,
    },
  });
