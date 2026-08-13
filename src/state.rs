use std::sync::{Mutex};

use crate::domain::post::Post;

pub struct AppState {
    pub posts: Mutex<Vec<Post>>,
    pub next_post_id: Mutex<u64>,
}