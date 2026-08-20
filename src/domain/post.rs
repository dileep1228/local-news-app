use serde::{Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
}

#[derive(Debug, Clone, serde::Serialize, sqlx::FromRow)]
pub struct Post {
    pub id: i64,
    pub user_id: i64,
    pub message: String,
    pub latitude: f64,
    pub longitude: f64,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreatePost {
    pub user_id: i64,
    pub message: String,
    pub location: Location,
}

impl CreatePost {
    pub fn validate(&self) -> Result<(), String> {
        if self.message.trim().is_empty() {
            return Err("Message cannot be empty".to_string());
        }

        if self.message.len() > 280 {
            return Err("Message is too long".to_string());
        }

        // -90.0 <= latitude <= 90.0
        if !(-90.0..=90.0).contains(&self.location.latitude) {
            return Err("Invalid latitude".to_string());
        }

        // -180.0 <= longitude <= 180.0
        if !(-180.0..=180.0).contains(&self.location.longitude) {
            return Err("Invalid longitude".to_string());
        }

        Ok(())
    }
}

#[derive(Debug, Deserialize)]
pub struct NearbyPostsRequest {
    pub latitude: f64,
    pub longitude: f64,
    pub radius: f64,
}

impl NearbyPostsRequest {
    pub fn validate(&self) -> Result<(), String> {
        if !(-90.0..=90.0).contains(&self.latitude) {
            return Err("Invalid latitude".into());
        }

        if !(-180.0..=180.0).contains(&self.longitude) {
            return Err("Invalid longitude".into());
        }

        if self.radius <= 0.0 {
            return Err("Radius must be positive".into());
        }

        Ok(())
    }
}