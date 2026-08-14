use std::sync::Arc;

use axum::{
    Json, extract::State,
};

use crate::{
    domain::post::{CreatePost, Post},
    state::AppState,
};

use crate::error::AppError;
use sqlx::query_as;

pub async fn get_posts(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Post>>, AppError> {
    let posts = sqlx::query_as::<_, Post>(
        r#"
        SELECT id, user_id, message
        FROM posts
        ORDER BY id DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    Ok(Json(posts))
}

pub async fn create_post(State(state): State<Arc<AppState>>, Json(input): Json<CreatePost>) -> Result<Json<Post>, AppError> {

    input.validate().map_err(AppError::BadRequest)?;
    
    let post = query_as::<_, Post>(
        r#"
        INSERT INTO posts (user_id, message)
        VALUES ($1, $2)
        RETURNING id, user_id, message
        "#
    )
    .bind(input.user_id)
    .bind(input.message)
    .fetch_one(&state.db)
    .await
    .map_err(|_| AppError::DatabaseError)?;

    Ok(Json(post))
}