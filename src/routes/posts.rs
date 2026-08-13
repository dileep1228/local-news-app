use std::sync::Arc;

use axum::{
    extract::State,
    Json,
};

use crate::{
    domain::post::{CreatePost, Post},
    state::AppState,
};

pub async fn get_posts(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<Post>> {
    let posts = state.posts.lock().unwrap();

    Json(posts.clone())
}

pub async fn create_post(State(state): State<Arc<AppState>>, Json(input): Json<CreatePost>) -> Json<Post> {
    
    let id: u64;
    
    {
        let mut next_id = state.next_post_id.lock().unwrap();

        id = *next_id;
        *next_id += 1;
    } // lock released here

    let post = Post {
        id,
        user_id: input.user_id,
        message: input.message,
    };

    let mut posts = state.posts.lock().unwrap();

    posts.push(post);

    Json(posts.last().unwrap().clone())
}