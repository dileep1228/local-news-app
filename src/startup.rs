use std::sync::Arc;

use axum::{
    routing::{ get },
    Router,
};

use crate::{
    routes::posts::{create_post, get_posts, get_post_by_id, delete_post, update_post, get_nearby_posts},
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
        .route("/posts/nearby", get(get_nearby_posts))
        .with_state(state)
}