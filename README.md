# Signal / Noise

A real-time, location-based community sharing app. Not a news app, despite
the folder name — people post whatever's happening around them right now
("street performance here," "accident on this street," "this coffee shop
is great"), and nearby users discover it. Posts are temporary (2-hour
default lifetime). Reactions are binary: **signal** ("show this to more
people nearby") or **noise** ("don't surface this further").

## Structure

```
backend/    Rust / Axum / PostgreSQL API
frontend/   React Native / Expo mobile app
```

Each has its own README with full details:
- [`backend/README.md`](backend/README.md) — API endpoints, request/response
  shapes, status codes, and a tracked backlog of known limitations.
- [`frontend/README.md`](frontend/README.md) — Expo project setup.

## Quick start

**Backend** (needs a running PostgreSQL instance):
```bash
cd backend
echo "DATABASE_URL=postgresql://<user>@localhost:5432/local_news" > .env
sqlx migrate run
cargo run               # serves on http://127.0.0.1:3000
```
`.env` is gitignored and not tracked — each machine needs its own.

**Frontend**:
```bash
cd frontend
npm install
npx expo start          # press w for web, or scan the QR with Expo Go
```

## Status

Backend: posts, location-based discovery (`/posts/nearby`), a scored
trending feed (`/posts/trending`), reactions with duplicate/expiry
handling, and reaction history — all implemented and tested against a
real database. No authentication yet; see the backend README's backlog
for what's deliberately deferred.

Frontend: project scaffolded (Expo Router, TypeScript), boilerplate
cleared out, verified running on web and Android. Real screens
(map-based discovery, swipe-to-react) not yet built.
