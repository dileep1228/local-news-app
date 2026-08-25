-- Add migration script here

ALTER TABLE posts
    ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 hours');