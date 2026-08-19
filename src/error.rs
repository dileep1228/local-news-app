use axum::{
    http::StatusCode, response::{IntoResponse, Response},
};

pub enum AppError {
    BadRequest(String),
    DatabaseError,
    NotFound(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::BadRequest(message) => {
                (StatusCode::BAD_REQUEST, message).into_response()
            }
            AppError::DatabaseError => {
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
            }
            AppError::NotFound(message) => {
                (StatusCode::NOT_FOUND, message).into_response()
            }
        }
    }
}
