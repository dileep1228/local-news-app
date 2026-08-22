use sqlx::PgPool;
use tracing::error;

use crate::{
    domain::post::{CreatePost, NearbyPostsRequest, Post, ReactionType},
    error::AppError,
};

/// Persists a new post in PostgreSQL and returns the inserted row.
///
/// Why this function lives in the repository layer:
/// - It owns database-specific logic.
/// - It keeps SQL out of HTTP handlers.
/// - It depends only on the database pool and domain/request data,
///   not on Axum or the full AppState.
///
/// `PgPool` is borrowed because this function does not own the pool.
/// SQLx will borrow a connection from the pool while executing the query.
pub async fn create_post(pool: &PgPool, input: CreatePost) -> Result<Post, AppError> {
    let post = sqlx::query_as::<_, Post>(
        r#"
        INSERT INTO posts (user_id, message, latitude, longitude)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, message, latitude, longitude, created_at, expires_at, signal_count, noise_count
        "#,
    )
    .bind(input.user_id)
    .bind(input.message)
    .bind(input.location.latitude)
    .bind(input.location.longitude)
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to insert post");
        AppError::DatabaseError
    })?;

    Ok(post)
}

pub async fn get_posts(pool: &PgPool) -> Result<Vec<Post>, AppError> {
    let posts = sqlx::query_as::<_, Post>(
        r#"
        SELECT id, user_id, message, latitude, longitude, created_at, expires_at, signal_count, noise_count
        FROM posts
        WHERE expires_at > NOW()
        ORDER BY id DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to fetch posts");
        AppError::DatabaseError
    })?;

    Ok(posts)
}

/// Retrieves a single post by its ID.
///
/// Why this returns `Option<Post>`:
/// - `Some(Post)` means the row exists.
/// - `None` means the query succeeded but no matching row was found.
/// - Database failures are returned as `AppError`.
pub async fn get_post_by_id(pool: &PgPool, id: i64) -> Result<Option<Post>, AppError> {
    let post = sqlx::query_as::<_, Post>(
        r#"
        SELECT id, user_id, message, latitude, longitude, created_at, expires_at, signal_count, noise_count
        FROM posts
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, post_id = id, "failed to fetch post by id");
        AppError::DatabaseError
    })?;

    Ok(post)
}

/// Deletes a post by ID.
///
/// Returns:
/// - `Ok(true)` if a post was deleted.
/// - `Ok(false)` if no post with that ID existed.
/// - `Err(AppError)` if the database operation failed.
pub async fn delete_post(pool: &PgPool, id: i64) -> Result<bool, AppError> {
    let result = sqlx::query(
        r#"
        DELETE FROM posts
        WHERE id = $1
        "#,
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, post_id = id, "failed to delete post");
        AppError::DatabaseError
    })?;

    Ok(result.rows_affected() > 0)
}

pub async fn update_post(pool: &PgPool, id: i64, input: CreatePost) -> Result<bool, AppError> {
    let result = sqlx::query(
        r#"
        UPDATE posts
        SET message = $1
        WHERE id = $2
        "#,
    )
    .bind(input.message)
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, post_id = id, "failed to update post");
        AppError::DatabaseError
    })?;

    Ok(result.rows_affected() > 0)
}

pub async fn post_exists(pool: &PgPool, message: &str) -> Result<bool, AppError> {
    let exists: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM posts
            WHERE message = $1
        )
        "#,
    )
    .bind(message)
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to check if post exists");
        AppError::DatabaseError
    })?;

    Ok(exists)
}

/// Inserts a reaction and bumps the matching counter on the post, atomically.
///
/// Uses a writable CTE so the INSERT and UPDATE run as a single statement:
/// if the INSERT violates the (post_id, user_id) unique constraint, the
/// whole statement is rolled back and the counters are never touched.
pub async fn react_to_post(
    pool: &PgPool,
    post_id: i64,
    user_id: i64,
    reaction: &ReactionType,
) -> Result<(), AppError> {
    let reaction_str = match reaction {
        ReactionType::Signal => "signal",
        ReactionType::Noise => "noise",
    };

    let result = sqlx::query(
        r#"
        WITH new_reaction AS (
            INSERT INTO post_reactions (post_id, user_id, reaction)
            VALUES ($1, $2, $3)
            RETURNING reaction
        )
        UPDATE posts
        SET
            signal_count = signal_count
                + CASE WHEN (SELECT reaction FROM new_reaction) = 'signal' THEN 1 ELSE 0 END,
            noise_count = noise_count
                + CASE WHEN (SELECT reaction FROM new_reaction) = 'noise' THEN 1 ELSE 0 END
        WHERE id = $1
        "#,
    )
    .bind(post_id)
    .bind(user_id)
    .bind(reaction_str)
    .execute(pool)
    .await;

    match result {
        Ok(_) => Ok(()),
        Err(sqlx::Error::Database(db_err)) => match db_err.code().as_deref() {
            // unique_violation: (post_id, user_id) already has a reaction
            Some("23505") => Err(AppError::Conflict(
                "You already reacted to this post".to_string(),
            )),
            // foreign_key_violation: post_id doesn't exist
            Some("23503") => Err(AppError::NotFound("Post not found".to_string())),
            _ => {
                error!(error = ?db_err, post_id, "failed to record reaction");
                Err(AppError::DatabaseError)
            }
        },
        Err(e) => {
            error!(error = ?e, post_id, "failed to record reaction");
            Err(AppError::DatabaseError)
        }
    }
}

// [TODO] We currently filter expired posts with WHERE expires_at > NOW().
// In the future, if data volume grows, consider adding a background task to archive
// or delete expired posts to improve long-term performance.

pub async fn get_nearby_posts(
    pool: &PgPool,
    request: NearbyPostsRequest,
) -> Result<Vec<Post>, AppError> {
    let posts = sqlx::query_as::<_, Post>(
        r#"
        SELECT id, user_id, message, latitude, longitude, created_at, expires_at, signal_count, noise_count
        FROM (
            SELECT
                id,
                user_id,
                message,
                latitude,
                longitude, created_at, expires_at, signal_count, noise_count,

                2 * 6371000 * ASIN(
                    SQRT(
                        POWER(
                            SIN(RADIANS(latitude - $1) / 2),
                            2
                        )
                        +
                        COS(RADIANS($1))
                        * COS(RADIANS(latitude))
                        * POWER(
                            SIN(RADIANS(longitude - $2) / 2),
                            2
                        )
                    )
                ) AS distance_meters

            FROM posts
            WHERE expires_at > NOW()
        ) nearby_posts

        WHERE distance_meters <= $3

        ORDER BY distance_meters ASC
        "#,
    )
    .bind(request.latitude)
    .bind(request.longitude)
    .bind(request.radius)
    .fetch_all(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to fetch nearby posts");
        AppError::DatabaseError
    })?;

    Ok(posts)
}
