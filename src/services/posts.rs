use sqlx::PgPool;

use crate::{
    domain::post::{CreatePost, Post},
    error::AppError,
    repository::posts as posts_repository,
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