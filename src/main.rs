use backend::{
    startup::build_app,
    state::AppState,
};

use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .init();


    let database_url =
        std::env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    let state = Arc::new(AppState {
        db: pool,
    });

    let app = build_app(state);

    let listener =
        tokio::net::TcpListener::bind("127.0.0.1:3000")
            .await
            .unwrap();

    tracing::info!("Server running on http://127.0.0.1:3000");

    axum::serve(listener, app)
        .await
        .unwrap();
}