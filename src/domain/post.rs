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