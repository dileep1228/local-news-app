use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct Post {
    pub id: i64,
    pub user_id: i64,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct CreatePost {
    pub user_id: i64,
    pub message: String,
}

impl CreatePost {
    pub fn validate(&self) -> Result<(), String> {
        if self.message.trim().is_empty() {
            return Err("Message cannot be empty".to_string());
        }

        if self.message.len() > 280 {
            return Err("Message is too long".to_string());
        }

        Ok(())
    }
}