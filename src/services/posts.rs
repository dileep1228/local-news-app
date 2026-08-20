use sqlx::PgPool;

use crate::{
    domain::post::{CreatePost, NearbyPostsRequest, Post}, error::AppError, repository::posts as posts_repository,
};

pub async fn create_post(
    pool: &PgPool,
    input: CreatePost,
) -> Result<Post, AppError> {

    input.validate()
        .map_err(AppError::BadRequest)?;

    let exists = posts_repository::post_exists(pool, &input.message).await?;

    if exists {
        return Err(AppError::BadRequest(
            "Duplicate post".to_string(),
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

     if request.radius > 50_000.0 {
        return Err(AppError::BadRequest(
            "Search radius cannot exceed 50 km".to_string(),
        ));
    }

    posts_repository::get_nearby_posts(
        pool,
        request,
    )
    .await
}