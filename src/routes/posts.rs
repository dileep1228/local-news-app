use std::sync::Arc;

use axum::{
    Json, extract::State, http::StatusCode,
};

use crate::{
    domain::post::{CreatePost, Post},
    state::AppState,
};

use crate::error::AppError;

pub async fn get_posts(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<Post>> {
    let posts = state.posts.lock().unwrap();

    Json(posts.clone())
}

pub async fn create_post(State(state): State<Arc<AppState>>, Json(input): Json<CreatePost>) -> Result<Json<Post>, AppError> {
    
    let id: u64;
    
    {
        let mut next_id = state.next_post_id.lock().unwrap();

        id = *next_id;
        *next_id += 1;
    } // lock released here

    let post = Post::new(
        id,
        input.user_id,
        input.message,
    ).map_err(AppError::BadRequest)?;

    let mut posts = state.posts.lock().unwrap();

    posts.push(post);

    Ok(Json(posts.last().unwrap().clone()))
}