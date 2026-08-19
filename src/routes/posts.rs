use std::sync::Arc;
use axum::extract::Path;

use axum::{
    Json, extract::{State},
    http::StatusCode,
};

use crate::{
    domain::post::{CreatePost, Post},
    repository::{ posts as posts_repository},
    state::AppState,
    services::posts as posts_service,
};

use crate::error::AppError;

pub async fn get_posts(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Post>>, AppError> {
    let posts = posts_repository::get_posts(&state.db).await?;

    Ok(Json(posts))
}

pub async fn create_post(State(state): State<Arc<AppState>>, Json(input): Json<CreatePost>) -> Result<Json<Post>, AppError> {
    
    let post = posts_service::create_post(
        &state.db,
        input,
    )
    .await?;

    Ok(Json(post))
}

pub async fn get_post_by_id(State(state): State<Arc<AppState>>, Path(id): Path<i64>) -> Result<Json<Post>, AppError> {
    let post = posts_repository::get_post_by_id(&state.db, id).await?;

    match post {
        Some(post) => {
            Ok(Json(post))
        }
        None => {
            Err(AppError::NotFound(
                "Post not found".to_string(),
            ))
        }
    }
}

pub async fn delete_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,
) -> Result<StatusCode, AppError> {
    let deleted = posts_repository::delete_post(
        &state.db,
        id,
    )
    .await?;

    if deleted {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(AppError::NotFound(
            "Post not found".to_string(),
        ))
    }
}

pub async fn update_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,
    Json(input): Json<CreatePost>
) -> Result<StatusCode, AppError> {
    let updated = posts_repository::update_post(
        &state.db,
        id,
        input
    )
    .await?;

    if updated {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(AppError::NotFound(
            "Post not found".to_string(),
        ))
    }
       
}