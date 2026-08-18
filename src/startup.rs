use std::sync::Arc;

use axum::{
    routing::{ get, delete, put},
    Router,
};

use crate::{
    routes::posts::{create_post, get_posts, get_post_by_id, delete_post, update_post},
    state::AppState,
};

pub async fn health_check() -> &'static str {
    "News backend is running!"
}

pub fn build_app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(health_check))
        .route("/posts", get(get_posts).post(create_post))
        .route(
    "/posts/{id}",
    get(get_post_by_id)
            .put(update_post)
            .delete(delete_post),
        )
        .with_state(state)
}