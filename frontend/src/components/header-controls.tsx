import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemePicker } from '@/components/theme-picker';
import { ViewToggle, type ViewMode } from '@/components/view-toggle';
import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';

type Props = {
  mode: ViewMode;
  onChangeMode: (mode: ViewMode) => void;
};

/**
 * The map/list toggle and the theme button, kept together in whichever header
 * is showing so neither takes space from the map.
 */
export function HeaderControls({ mode, onChangeMode }: Props) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={styles.row}>
      <Pressable style={styles.themeButton} onPress={() => setPickerOpen(true)} hitSlop={6}>
        <Text style={styles.themeButtonText}>Aa</Text>
      </Pressable>

      <ViewToggle mode={mode} onChange={onChangeMode} />

      <ThemePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    themeButton: {
      paddingVertical: 5,
      paddingHorizontal: 9,
      backgroundColor: theme.block,
      borderRadius: theme.radius.bar,
    },
    themeButtonText: {
      color: theme.muted,
      fontSize: 11.5,
      fontWeight: '700',
    },
  });
