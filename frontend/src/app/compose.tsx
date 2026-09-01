import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COUNTER_NEAR_AT, MAX_MESSAGE_LENGTH } from '@/constants/config';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { ApiError, createPost } from '@/lib/api';
import { formatDistance } from '@/lib/geo';
import { useTheme } from '@/theme/context';
import type { Theme } from '@/theme/themes';

/**
 * Compose, per the Claude Design handoff. Two decisions from that sheet worth
 * keeping intact:
 *
 * - Every rule the backend enforces is visible *before* Post is tapped, not
 *   discovered after. Over-length is caught here; duplicates still surface
 *   from the server, since the client has no list of the author's live posts.
 * - Location is a line of text with a Move action, not a draggable pin. The
 *   post is about where you are, and a freely draggable pin invites posting
 *   about places you are not.
 */
export default function ComposeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = makeStyles(theme);

  const { center, accuracy, error: locationError } = useCurrentLocation();
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function edit(text: string) {
    setMessage(text);
    setServerError(null);
  }

  const trimmed = message.trim();
  const remaining = MAX_MESSAGE_LENGTH - message.length;
  const over = remaining < 0;
  const near = remaining <= COUNTER_NEAR_AT && !over;
  const empty = trimmed.length === 0;
  const blocked = empty || over || posting || center === null;

  const inlineError = over
    ? `${Math.abs(remaining)} character${Math.abs(remaining) === 1 ? '' : 's'} over. Trim it to ${MAX_MESSAGE_LENGTH}.`
    : serverError;

  const counterColor = over ? theme.accent : near ? theme.accentDeep : theme.muted;

  async function submit() {
    if (blocked || !center) return;

    setPosting(true);
    setServerError(null);

    try {
      await createPost(center, trimmed);
      // back(), not push - the map keeps its radius, selection and camera.
      router.back();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setPosting(false);
    }
  }

  return (
    <View style={styles.screen}>
      {center ? (
        <Map style={styles.map} mapStyle={theme.mapStyleUrl}>
          <Camera center={center} zoom={16} padding={{ bottom: 420 }} />
          <Marker lngLat={center} anchor="center">
            <View style={[styles.pinHalo, !empty && styles.pinHaloActive]}>
              <View style={[styles.pinDot, !empty && styles.pinDotActive]} />
            </View>
          </Marker>
        </Map>
      ) : (
        <View style={styles.map} />
      )}

      <View style={[styles.nav, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.navTitle}>New post</Text>
        <Text style={[styles.navCount, { color: counterColor }]}>
          {over ? remaining : `${message.length}/${MAX_MESSAGE_LENGTH}`}
        </Text>
      </View>

      {/*
        "padding" on Android too, against Expo's documented advice to leave the
        behaviour undefined there. That advice assumes the window resizes for
        the keyboard, which an edge-to-edge window does not - apps targeting
        Android 15 are forced edge-to-edge, so the adjustResize in the manifest
        is declared and then ignored, and an undefined behaviour leaves this a
        plain View that does nothing. Nothing resizes, so padding cannot
        double-compensate.
      */}
      <KeyboardAvoidingView behavior="padding" style={styles.sheetWrap}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.body}>
            <Text style={styles.kicker}>Your message</Text>

            <TextInput
              style={styles.input}
              value={message}
              onChangeText={edit}
              placeholder="What's happening here?"
              placeholderTextColor={theme.muted}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            <View style={styles.countRow}>
              <View style={styles.meter}>
                <View
                  style={[
                    styles.meterFill,
                    {
                      width: `${Math.min(100, (message.length / MAX_MESSAGE_LENGTH) * 100)}%`,
                      backgroundColor: counterColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.count, { color: counterColor }]}>
                {near ? `${remaining} left` : remaining}
              </Text>
            </View>
          </View>

          <View style={styles.locRow}>
            <View style={styles.locMark} />
            <View style={styles.locText}>
              <Text style={styles.kicker}>Posting from</Text>
              <Text style={styles.locValue}>
                {locationError
                  ? locationError
                  : center
                    ? `Your location${accuracy ? ` · ±${formatDistance(accuracy)}` : ''}`
                    : 'Finding your location...'}
              </Text>
            </View>
          </View>

          {inlineError ? (
            <View style={styles.errRow}>
              <Text style={styles.errText}>{inlineError}</Text>
            </View>
          ) : null}

          <View style={styles.body}>
            <Pressable
              style={[styles.postButton, blocked && styles.postButtonBlocked]}
              disabled={blocked}
              onPress={submit}
            >
              <Text style={[styles.postLabel, blocked && styles.postLabelBlocked]}>
                {posting ? 'Posting...' : 'Post'}
              </Text>
            </Pressable>

            {/*
              Not "visible within Xmi": there is no poster-chosen radius. Who
              sees a post depends on the radius the *reader* has selected, so
              the only honest promise here is the expiry.
            */}
            <Text style={styles.fineprint}>
              Anyone nearby can see this. Disappears in 2 hours.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.mapBg,
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    pinHalo: {
      width: 72,
      height: 72,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.muted,
      borderRadius: theme.radius.roundPins ? 36 : 0,
      opacity: 0.5,
    },
    pinHaloActive: {
      borderStyle: 'solid',
      borderColor: theme.accent,
      opacity: 0.6,
    },
    pinDot: {
      width: 24,
      height: 24,
      backgroundColor: theme.muted,
      borderWidth: 2,
      borderColor: theme.paper,
      borderRadius: theme.radius.roundPins ? 12 : 0,
      opacity: 0.6,
    },
    pinDotActive: {
      width: 36,
      height: 36,
      backgroundColor: theme.accent,
      borderRadius: theme.radius.roundPins ? 18 : 0,
      opacity: 1,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: theme.paper,
      borderBottomWidth: theme.edges.sheetBorderWidth || 1,
      borderBottomColor: theme.edges.sheetBorderColor || theme.edges.hairline,
    },
    cancel: {
      color: theme.muted,
      fontFamily: theme.fonts.body,
      fontSize: 13.5,
      fontWeight: '600',
    },
    navTitle: {
      color: theme.ink,
      fontFamily: theme.fonts.display,
      fontSize: 15,
      fontWeight: '700',
    },
    navCount: {
      fontFamily: theme.fonts.numeral,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
      minWidth: 46,
      textAlign: 'right',
    },
    sheetWrap: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.paper,
      borderTopWidth: theme.edges.sheetBorderWidth || 1,
      borderTopColor: theme.edges.sheetBorderColor || theme.edges.hairline,
      borderTopLeftRadius: theme.radius.sheet,
      borderTopRightRadius: theme.radius.sheet,
    },
    body: {
      paddingHorizontal: 18,
      paddingTop: 14,
    },
    kicker: {
      color: theme.muted,
      fontFamily: theme.fonts.numeral,
      fontSize: 9.8,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 104,
      marginTop: 8,
      color: theme.ink,
      fontFamily: theme.fonts.display,
      fontSize: 19,
      lineHeight: 26,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 6,
      paddingBottom: 14,
    },
    meter: {
      flex: 1,
      height: 4,
      backgroundColor: theme.block,
      overflow: 'hidden',
      borderRadius: theme.radius.button ? 2 : 0,
    },
    meterFill: {
      height: '100%',
    },
    count: {
      fontFamily: theme.fonts.numeral,
      fontSize: 11,
      fontWeight: '700',
      minWidth: 48,
      textAlign: 'right',
    },
    locRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 13,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.edges.hairline,
    },
    locMark: {
      width: 14,
      height: 14,
      borderWidth: 3,
      borderColor: theme.accentDeep,
      borderRadius: theme.radius.roundPins ? 7 : 0,
    },
    locText: {
      flex: 1,
      minWidth: 0,
    },
    locValue: {
      color: theme.ink,
      fontFamily: theme.fonts.display,
      fontSize: 14.5,
      fontWeight: '600',
      marginTop: 2,
    },
    errRow: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      backgroundColor: theme.block,
      borderBottomWidth: 1,
      borderBottomColor: theme.edges.hairline,
    },
    errText: {
      color: theme.accentDeep,
      fontFamily: theme.fonts.body,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
    },
    postButton: {
      paddingVertical: 15,
      paddingHorizontal: 16,
      backgroundColor: theme.accent,
      borderRadius: theme.radius.button,
    },
    postButtonBlocked: {
      backgroundColor: theme.block,
      opacity: 0.75,
    },
    postLabel: {
      color: theme.onAccent,
      fontFamily: theme.fonts.display,
      fontSize: 15,
      fontWeight: '700',
      textAlign: theme.flushLeftButtons ? 'left' : 'center',
    },
    postLabelBlocked: {
      color: theme.muted,
    },
    fineprint: {
      color: theme.muted,
      fontFamily: theme.fonts.body,
      fontSize: 11.5,
      lineHeight: 17,
      paddingTop: 10,
      paddingHorizontal: 2,
      textAlign: theme.flushLeftButtons ? 'left' : 'center',
    },
  });
