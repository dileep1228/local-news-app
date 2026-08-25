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
| `POST` | `/posts/{id}/reaction` | React to a post with `signal` or `noise`. |

## Details

### `POST /posts`
Body: `{ "user_id": i64, "message": string, "location": { "latitude": f64, "longitude": f64 } }`
Message must be non-empty and ≤280 chars; duplicate messages are rejected (`400`).

### `GET /posts/nearby`
Query: `user_id`, `latitude`, `longitude`, `radius` (meters, required, max 50km).
A "swipe deck" — once a post is reacted to, it stops appearing here for that user.

### `GET /posts/trending`
Query: `latitude`, `longitude`, `radius` (meters, required), `limit` (optional, default 50, max 100).
Ranked by `(signal_count + 5) / (signal_count + noise_count + 10)` — a smoothed
score so a post with one early reaction can't outrank one with real engagement.
Not personalized; doesn't hide posts you've already reacted to.

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

## Known limitations (deferred by design)

- No authentication — `user_id` is a client-supplied value, not verified.
- Location queries (`nearby`, `trending`) scan all active posts and compute
  distance per row; no spatial index yet. Fine at current scale.
- `trending` always requires a location + radius; a global "world" tier
  (no location filter) is not implemented.
- Post lifetime is fixed at creation; it does not extend based on engagement.
