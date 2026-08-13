use backend::{startup::build_app, state::AppState};
use std::sync::{Arc, Mutex};

#[tokio::main]
async fn main() {
    let state = Arc::new(AppState {
        posts: Mutex::new(Vec::new()),
        next_post_id: Mutex::new(1),
    });

    let app = build_app(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("Server running on http://127.0.0.1:3000");

    axum::serve(listener, app)
        .await
        .unwrap();
}

