# Backend API

Rust / Axum / PostgreSQL backend for a location-based, ephemeral community
sharing app. Posts are temporary (default lifetime: 2 hours) and reactions
are binary: **signal** ("show this to more people nearby") or **noise**
("don't surface this further").

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Health check. |
| `GET` | `/posts` | List all active (non-expired) posts, newest first. |
| `POST` | `/posts` | Create a post. |
| `GET` | `/posts/{id}` | Get a single post by id. Works even if expired (history/audit). |
| `PUT` | `/posts/{id}` | Update a post's message. |
| `DELETE` | `/posts/{id}` | Delete a post. |
| `GET` | `/posts/nearby` | Personal discovery feed: active posts within a radius, excluding ones this user already reacted to. |
| `GET` | `/posts/trending` | Community leaderboard: active posts within a radius, ranked by engagement score. Same list for everyone. |
| `GET` | `/posts/reacted` | History: posts a user has reacted to, most recent first. Includes expired posts. |
| `POST` | `/posts/{id}/reaction` | React to a post with `signal` or `noise`. |

## Details

### `POST /posts`
Body: `{ "user_id": i64, "message": string, "location": { "latitude": f64, "longitude": f64 } }`
Message must be non-empty and ≤280 chars; duplicate messages are rejected (`400`).

### `GET /posts/nearby`
Query: `user_id`, `latitude`, `longitude`, `radius` (meters, required, max 50km),
`sort` (optional: `distance` default, or `score` for the same smoothed
engagement ranking trending uses), `limit` (optional, default 50, max 100).
A "swipe deck" — once a post is reacted to, it stops appearing here for that user.

### `GET /posts/trending`
Query: `latitude`, `longitude`, `radius` (meters, required), `limit` (optional, default 50, max 100).
Ranked by `(signal_count + 5) / (signal_count + noise_count + 10)` — a smoothed
score so a post with one early reaction can't outrank one with real engagement.
Not personalized; doesn't hide posts you've already reacted to.

### `GET /posts/reacted`
Query: `user_id`, `limit` (optional, default 50, max 100).
Unlike every other posts-listing endpoint, this one does **not** filter out
expired posts — it's a history view, so a post you reacted to should still
show up after it expires. Includes the `reaction` you gave and `reacted_at`.

### `POST /posts/{id}/reaction`
Body: `{ "user_id": i64, "reaction": "signal" | "noise" }`
One reaction per `(post, user)`, enforced atomically alongside the counter update.

## Status codes

| Code | Meaning |
|---|---|
| `400` | Invalid input (bad coordinates, empty/oversized message, duplicate post). |
| `404` | Post doesn't exist. |
| `409` | User already reacted to this post. |
| `410` | Post has expired — reactions are no longer accepted. |
| `500` | Database/server error. |

## Known limitations / backlog (deferred by design)

Tracked here so they don't get lost — none of these are bugs, they're
deliberate "not yet" calls made while keeping scope small.

- **No pagination** — `GET /posts` and `GET /posts/nearby` return every
  matching row, unbounded. `trending` has `limit`, these don't.
- **The duplicate-message check ignores expiry** — `post_exists` matches
  against every row ever written, including long-expired ones, so a
  message can only ever be posted once in the lifetime of the database.
  Nobody could post "Free coffee at the corner shop" twice, years apart.
  It should almost certainly only consider active posts, and probably
  only the same author's.
- **No rate limiting / abuse protection** on any endpoint.
- **No authentication** — `user_id` is a client-supplied value on every
  endpoint, not verified. Everything downstream (nearby's exclusion filter,
  reaction ownership) trusts it as-is.
- **⚠️ The server binds to `0.0.0.0`**, so anyone on the same network can
  reach it — and since there's no auth, they can read, post, react, and
  **delete**. This is needed for a phone to reach the dev server, and is
  fine on a trusted home network. On untrusted Wi-Fi (cafe, airport,
  coworking, conference), change the bind in `src/main.rs` back to
  `127.0.0.1` or don't run the server. The risk is `0.0.0.0` *combined
  with* no auth — binding to all interfaces is normal for real servers,
  they just require you to prove who you are first. Never expose this
  port publicly as-is; a real deployment needs HTTPS, a reverse proxy,
  and authentication.
- **No user accounts/profiles** — no `users` table, no signup/login/logout,
  no sessions. A real prerequisite for real authentication.
- **No caching** — trending in particular recomputes from scratch on every
  request, even though "what's trending" doesn't need per-request freshness.
- **Repository/service layer has no automated test coverage** — only the
  pure `validate()` methods are unit-tested; everything that touches
  Postgres (create, react, nearby, trending) has only been verified
  manually. Would need a real or test database to cover properly.
- Location queries (`nearby`, `trending`) scan all active posts and compute
  distance per row; no spatial index yet. Fine at current scale.
- `trending` always requires a location + radius; a global "world" tier
  (no location filter) is not implemented. Real city/state/country tiers
  were also considered - the cheap path turns out to be reverse geocoding
  done client-side (Expo's on-device geocoder is free), sending `city`/
  `state`/`country` up alongside `latitude`/`longitude` at post-creation
  time, so trending could filter with a plain `WHERE city = $1` - no
  PostGIS needed. Not built: needs a schema change, doesn't backfill
  existing posts, and needs geocoding on both the post-creation and the
  trending-request side.
- Post lifetime is fixed at creation; it does not extend based on engagement.
- No frontend yet — everything above has only been exercised via curl.
