import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemeControls } from '@/theme/context';
import { THEMES, type Theme } from '@/theme/themes';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** Swatches of a theme's heat ramp, so the choice is visible before picking. */
function Swatches({ option }: { option: Theme }) {
  const steps = option.heat;

  return (
    <View style={pickerStyles.swatchRow}>
      {steps.map((color, index) => (
        <View
          key={index}
          style={[
            pickerStyles.swatch,
            {
              backgroundColor: color,
              borderRadius: option.radius.roundPins ? 7 : 0,
              borderColor: option.paper,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function ThemePicker({ visible, onClose }: Props) {
  const theme = useTheme();
  const { setThemeId } = useThemeControls();
  const styles = makeStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Appearance</Text>

          {THEMES.map((option) => {
            const active = option.id === theme.id;

            return (
              <Pressable
                key={option.id}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => {
                  setThemeId(option.id);
                  onClose();
                }}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{option.name}</Text>
                  <Text style={styles.optionBlurb}>{option.blurb}</Text>
                </View>
                <Swatches option={option} />
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  swatchRow: {
    flexDirection: 'row',
    gap: 3,
  },
  swatch: {
    width: 14,
    height: 14,
    borderWidth: 1,
  },
});

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    panel: {
      backgroundColor: theme.paper,
      borderRadius: theme.radius.sheet,
      paddingVertical: 14,
      paddingHorizontal: 6,
    },
    title: {
      color: theme.muted,
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginHorizontal: 6,
      borderRadius: theme.radius.button,
    },
    optionActive: {
      backgroundColor: theme.block,
    },
    optionText: {
      flex: 1,
    },
    optionName: {
      color: theme.ink,
      fontSize: 15,
      fontWeight: '700',
    },
    optionBlurb: {
      color: theme.muted,
      fontSize: 12,
      marginTop: 2,
    },
  });
