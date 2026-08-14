use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub enum AppError {
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::BadRequest(message) => {
                (StatusCode::BAD_REQUEST, message).into_response()
            }
        }
    }
}
