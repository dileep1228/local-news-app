-- Add migration script here

ALTER TABLE posts 
    ADD COLUMN longitude DOUBLE PRECISION NOT NULL,
    ADD COLUMN latitude DOUBLE PRECISION NOT NULL;