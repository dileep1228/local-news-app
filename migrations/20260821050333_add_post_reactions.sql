-- Add reaction counters to posts

ALTER TABLE posts
    ADD COLUMN signal_count BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN noise_count BIGINT NOT NULL DEFAULT 0;

-- Store one reaction per user per post
CREATE TABLE post_reactions (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    reaction TEXT NOT NULL CHECK (reaction IN ('signal', 'noise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_id)
);