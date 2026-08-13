use std::sync::Arc;

use axum::{
    routing::get,
    Router,
};

use crate::{
    routes::posts::{create_post, get_posts},
    state::AppState,
};

pub async fn health_check() -> &'static str {
    "News backend is running!"
}

pub fn build_app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(health_check))
        .route("/posts", get(get_posts).post(create_post))
        .with_state(state)
}