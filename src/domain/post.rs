use serde::{Deserialize, Serialize};

#[derive(Serialize, Clone)]
pub struct Post {
    pub id: u64,
    pub user_id: u64,
    pub message: String,
}

#[derive(Deserialize)]
pub struct CreatePost {
    pub user_id: u64,
    pub message: String,
}

/*
 * A post cannot be empty and cannot exceed 280 characters.
 */
impl Post {
    pub fn new(
        id: u64,
        user_id: u64,
        message: String,
    ) -> Result<Post, String> {
        if message.trim().is_empty() {
            return Err("Message cannot be empty".to_string());
        }
        if message.len() > 280 {
            return Err("Message is too long".to_string());
        }

        Ok( Post { id, user_id, message })
    }
}