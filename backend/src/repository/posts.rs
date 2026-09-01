use sqlx::PgPool;
use tracing::error;

use crate::{
    domain::post::{
        CreatePost, NearbyPostsRequest, NearbySort, Post, ReactedPost, ReactedPostsRequest,
        ReactionType, TrendingPostsRequest,
    },
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

/// Seconds since this author's most recent post, or None if they've never
/// posted. Counts expired posts too - the point is pacing the author, not
/// what is currently visible.
pub async fn seconds_since_last_post(
    pool: &PgPool,
    user_id: i64,
) -> Result<Option<f64>, AppError> {
    let seconds: Option<f64> = sqlx::query_scalar(
        r#"
        SELECT EXTRACT(EPOCH FROM (NOW() - MAX(created_at)))::float8
        FROM posts
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .fetch_one(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, user_id, "failed to check last post time");
        AppError::DatabaseError
    })?;

    Ok(seconds)
}

/// Whether this author already has this message live.
///
/// Scoped to active posts and to the same author on purpose. Matching every
/// row ever written meant a message could only be posted once for the lifetime
/// of the database - nobody could report "Free coffee at the corner shop" twice
/// months apart. Scoping to one author still stops someone flooding the map,
/// while letting two neighbours independently report the same street closure,
/// which is legitimate signal rather than spam.
pub async fn post_exists(
    pool: &PgPool,
    user_id: i64,
    message: &str,
) -> Result<bool, AppError> {
    let exists: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM posts
            WHERE message = $1
              AND user_id = $2
              AND expires_at > NOW()
        )
        "#,
    )
    .bind(message)
    .bind(user_id)
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

    let is_active: Option<bool> = sqlx::query_scalar(
        "SELECT expires_at > NOW() FROM posts WHERE id = $1",
    )
    .bind(post_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, post_id, "failed to check post expiry");
        AppError::DatabaseError
    })?;

    match is_active {
        None => return Err(AppError::NotFound("Post not found".to_string())),
        Some(false) => return Err(AppError::Gone("This post has expired".to_string())),
        Some(true) => {}
    }

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
    // ORDER BY can't be parameterized with a bind() placeholder - those only
    // work for values, not SQL expressions/identifiers. Safe to interpolate
    // here because order_by only ever comes from this fixed match, never
    // from raw user input; the actual values (lat/long/radius/user_id/limit)
    // still go through bind() as normal.
    let order_by = match request.sort.unwrap_or(NearbySort::Distance) {
        NearbySort::Distance => "distance_meters ASC",
        NearbySort::Score => "(signal_count + 5.0) / (signal_count + noise_count + 10.0) DESC",
    };
    let limit = request.limit.unwrap_or(50).clamp(1, 100);

    let query = format!(
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
              AND NOT EXISTS (
                  SELECT 1
                  FROM post_reactions pr
                  WHERE pr.post_id = posts.id
                    AND pr.user_id = $4
              )
        ) nearby_posts

        WHERE distance_meters <= $3

        ORDER BY {order_by}
        LIMIT $5
        "#
    );

    let posts = sqlx::query_as::<_, Post>(&query)
        .bind(request.latitude)
        .bind(request.longitude)
        .bind(request.radius)
        .bind(request.user_id)
        .bind(limit)
        .fetch_all(pool)
        .await
        .map_err(|e| {
            error!(error = ?e, "failed to fetch nearby posts");
            AppError::DatabaseError
        })?;

    Ok(posts)
}

// [TODO] Trending currently always requires a location + radius. A "world"
// tier (no location filter at all, just the highest-scored posts globally)
// was deliberately deferred - the radius approach approximates city/state/
// country scope by just choosing a bigger number, without needing real
// geocoding or PostGIS.
//
// [TODO] Like get_nearby_posts, this scans and scores every active post
// before filtering by distance - there's no spatial index yet, so query
// cost scales with total active post volume, not with radius. Fine at
// current scale; revisit with a bounding-box pre-filter or PostGIS once
// post volume grows.
//
// Ranking uses a Bayesian-style smoothed score instead of a raw ratio, so a
// post with 1 signal / 0 noise doesn't outrank one with 100 signal / 5 noise:
// score = (signal_count + 5) / (signal_count + noise_count + 10)
// This is equivalent to assuming every post starts with 5 imaginary signal
// and 5 imaginary noise reactions, so a post needs real engagement before
// its own ratio can dominate the score.
pub async fn get_trending_posts(
    pool: &PgPool,
    request: TrendingPostsRequest,
) -> Result<Vec<Post>, AppError> {
    let limit = request.limit.unwrap_or(50).clamp(1, 100);

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
        ) trending_posts

        WHERE distance_meters <= $3

        ORDER BY (signal_count + 5.0) / (signal_count + noise_count + 10.0) DESC
        LIMIT $4
        "#,
    )
    .bind(request.latitude)
    .bind(request.longitude)
    .bind(request.radius)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to fetch trending posts");
        AppError::DatabaseError
    })?;

    Ok(posts)
}

/// Posts a user has reacted to, most recent reaction first. Deliberately
/// does not filter by expires_at - this is a history view, so expired
/// posts the user reacted to should still show up.
pub async fn get_reacted_posts(
    pool: &PgPool,
    request: ReactedPostsRequest,
) -> Result<Vec<ReactedPost>, AppError> {
    let limit = request.limit.unwrap_or(50).clamp(1, 100);

    let posts = sqlx::query_as::<_, ReactedPost>(
        r#"
        SELECT
            p.id, p.user_id, p.message, p.latitude, p.longitude,
            p.created_at, p.expires_at, p.signal_count, p.noise_count,
            pr.reaction, pr.created_at AS reacted_at
        FROM post_reactions pr
        JOIN posts p ON p.id = pr.post_id
        WHERE pr.user_id = $1
        ORDER BY pr.created_at DESC
        LIMIT $2
        "#,
    )
    .bind(request.user_id)
    .bind(limit)
    .fetch_all(pool)
    .await
    .map_err(|e| {
        error!(error = ?e, "failed to fetch reacted posts");
        AppError::DatabaseError
    })?;

    Ok(posts)
}
