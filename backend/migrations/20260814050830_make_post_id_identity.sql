-- Add migration script here

ALTER TABLE posts
    ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;