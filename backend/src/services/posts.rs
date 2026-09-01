use sqlx::PgPool;

/// See the note in create_post for why this is short.
const POST_COOLDOWN_SECONDS: f64 = 60.0;

use crate::{
    domain::post::{
        CreatePost, NearbyPostsRequest, Post, ReactedPost, ReactedPostsRequest, ReactToPost,
        TrendingPostsRequest,
    },
    error::AppError,
    repository::posts as posts_repository,
};

pub async fn create_post(
    pool: &PgPool,
    input: CreatePost,
) -> Result<Post, AppError> {

    input.validate()
        .map_err(AppError::BadRequest)?;

    // A short cooldown so a double-tap or a stuck retry can't flood the map.
    // Deliberately short: someone at a street festival may legitimately report
    // three different things in a couple of minutes, and the product wants
    // those. Keyed on user_id, which is client-supplied and unverified, so this
    // is a guardrail rather than a real control until authentication exists.
    if let Some(seconds) = posts_repository::seconds_since_last_post(pool, input.user_id).await? {
        if seconds < POST_COOLDOWN_SECONDS {
            let wait = (POST_COOLDOWN_SECONDS - seconds).ceil() as i64;
            return Err(AppError::TooManyRequests(format!(
                "Wait {wait}s before posting again"
            )));
        }
    }

    let exists = posts_repository::post_exists(pool, input.user_id, &input.message).await?;

    if exists {
        return Err(AppError::BadRequest(
            "You have already posted this".to_string(),
        ));
    }

    posts_repository::create_post(
        pool,
        input,
    )
    .await
}

pub async fn get_near_by_posts(
    pool: &PgPool,
    request: NearbyPostsRequest
) -> Result<Vec<Post>, AppError> {

    request
        .validate()
        .map_err(AppError::BadRequest)?;

     // 10 miles is 16_093m; rounded up so the client's widest option fits.
     if request.radius > 16_100.0 {
        return Err(AppError::BadRequest(
            "Search radius cannot exceed 10 miles".to_string(),
        ));
    }

    posts_repository::get_nearby_posts(
        pool,
        request,
    )
    .await
}

pub async fn get_trending_posts(
    pool: &PgPool,
    request: TrendingPostsRequest,
) -> Result<Vec<Post>, AppError> {
    request
        .validate()
        .map_err(AppError::BadRequest)?;

    posts_repository::get_trending_posts(
        pool,
        request,
    )
    .await
}

pub async fn get_reacted_posts(
    pool: &PgPool,
    request: ReactedPostsRequest,
) -> Result<Vec<ReactedPost>, AppError> {
    posts_repository::get_reacted_posts(
        pool,
        request,
    )
    .await
}

pub async fn react_to_post(
    pool: &PgPool,
    post_id: i64,
    input: ReactToPost,
) -> Result<(), AppError> {
    posts_repository::react_to_post(
        pool,
        post_id,
        input.user_id,
        &input.reaction,
    )
    .await
}