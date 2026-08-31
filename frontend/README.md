# Signal / Noise — mobile app

React Native (Expo) client for the location-based community sharing app. See
[`../backend/README.md`](../backend/README.md) for the API it talks to.

## Running it

```bash
npm install
npx expo start
```

The app is a **development build**, not Expo Go — `react-native-maps` was
replaced with MapLibre, and MapLibre needs native code Expo Go doesn't carry.
Install the APK from EAS, open it, and point it at the dev server's LAN address
(`http://<mac-lan-ip>:8081`). `localhost` won't work: on the phone that means
the phone.

Rebuild (`eas build --platform android --profile development`) only when native
code changes — a new native package, or a change to `app.json`. Screens, styles
and API calls hot-reload in under a second.

## Structure

Mirrors the backend's layering:

| Backend | Here | Role |
|---|---|---|
| `domain/` | `src/types/` | Data shapes |
| `repository/` | `src/lib/api.ts` | Talks to the outside world |
| `services/` | `src/hooks/` | Orchestration and state |
| `routes/` | `src/app/` + `src/components/` | Presentation |

`src/theme/` holds the appearance system; `src/lib/` holds pure logic (scoring,
geometry, time formatting).

## Appearance system

Five themes, transcribed from the Claude Design **"Theme Spec · All Five"**
handoff. That sheet is the source of truth — `src/theme/themes.ts` should match
it exactly, and every value there is deliberate. Re-read it before changing a
colour.

| Theme | Character | Basemap |
|---|---|---|
| **Modernist** *(default)* | Flat, 2px rules, one red | positron |
| Noticeboard | Cream and ink, serif headlines | positron |
| Instrument | Dark panel, monospace, amber | **dark-matter** (required) |
| Civic | Rounded, transit-map calm | **bright** (wants colour tiles) |
| Overprint | Two inks on newsprint, poster type | positron (greyscale mandatory) |

### Rules that are easy to get wrong

- **Six heat tiers, not more.** Sizes `58 / 48 / 40 / 34 / 28 / 20` are shared
  across all themes; only colour and shape are theme-driven.
- **`lightTextTiers` differs per theme** — Instrument is inverted (dark text on
  its hottest amber), Overprint takes light text down to tier 4. Bright yellows
  and oranges cannot carry white text.
- **The basemap is part of the theme.** Instrument on positron inverts the
  hierarchy; Civic is the only theme that wants colour tiles.
- **Accent has three roles**: `accent` (fill), `accentDeep` (small text), and
  `onAccent` (text on the fill). In Noticeboard the signal button is *ink*, not
  the accent — the heat ramp owns colour there.
- **Zero radius in Modernist is deliberate.** "Do not round a corner anywhere."
- Shared interaction values live as constants in `themes.ts`: selected scale
  1.12, unselected dim 0.55, halo inset −10 at 0.45 opacity, transitions 300ms.

### Not yet implemented from the spec

- **Typefaces.** Each theme names a family (Archivo, Newsreader, IBM Plex Mono,
  Space Grotesk, Bricolage Grotesque) — all Google Fonts under the OFL, so they
  can be bundled. Needs `@expo-google-fonts/*`. Everything currently renders in
  the system font, which costs Instrument the most.
- **Age decay on pins.** `ageOpacity()` exists in `themes.ts` but nothing calls
  it; pins should fade as posts approach expiry.
- **Per-theme button copy.** The spec varies it (Civic says "Show more / Not
  useful", Instrument brackets its labels). Listed there as an open question.
- **Theme choice isn't persisted** — restarting resets to the default.
- **Overprint's multiply blend**, which React Native can't do. The spec
  pre-multiplied its ramp so no blend mode is needed, but the effect differs.

## Views

Two layouts from the same handoff, sharing all state:

- **Map** (design `1c`) — persistent bottom sheet. Selecting a pin centres the
  camera on it with bottom padding equal to the sheet, so it can't hide behind.
- **List** (design `1d`) — split map over a ranked ledger. Rows swipe right to
  signal, left to noise.

## Known gaps

- No way to create a post from the app yet.
- `user_id` is hardcoded (`constants/config.ts`); there's no auth.
- `API_URL` is a hardcoded LAN address and breaks when the network changes.
- `trendScore()` and `distanceMetres()` duplicate backend logic. Both would be
  better as fields on the API response.
