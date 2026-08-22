use backend::domain::post::{CreatePost, Location, NearbyPostsRequest};

fn valid_post() -> CreatePost {
    CreatePost {
        user_id: 1,
        message: "There's a street performance here!".to_string(),
        location: Location {
            latitude: 47.6062,
            longitude: -122.3321,
        },
    }
}

#[test]
fn validate_rejects_empty_message() {
    let post = CreatePost { message: "   ".to_string(), ..valid_post() };
    assert!(post.validate().is_err());
}

#[test]
fn validate_rejects_message_over_280_chars() {
    let post = CreatePost { message: "a".repeat(281), ..valid_post() };
    assert!(post.validate().is_err());
}

#[test]
fn validate_accepts_message_at_280_chars() {
    let post = CreatePost { message: "a".repeat(280), ..valid_post() };
    assert!(post.validate().is_ok());
}

#[test]
fn validate_rejects_out_of_range_latitude() {
    let post = CreatePost {
        location: Location { latitude: 90.1, longitude: 0.0 },
        ..valid_post()
    };
    assert!(post.validate().is_err());
}

#[test]
fn validate_rejects_out_of_range_longitude() {
    let post = CreatePost {
        location: Location { latitude: 0.0, longitude: 180.1 },
        ..valid_post()
    };
    assert!(post.validate().is_err());
}

#[test]
fn validate_accepts_boundary_coordinates() {
    let post = CreatePost {
        location: Location { latitude: -90.0, longitude: 180.0 },
        ..valid_post()
    };
    assert!(post.validate().is_ok());
}

#[test]
fn validate_accepts_valid_post() {
    assert!(valid_post().validate().is_ok());
}

fn valid_nearby_request() -> NearbyPostsRequest {
    NearbyPostsRequest {
        latitude: 47.6062,
        longitude: -122.3321,
        radius: 1000.0,
    }
}

#[test]
fn nearby_validate_rejects_out_of_range_latitude() {
    let req = NearbyPostsRequest { latitude: -90.1, ..valid_nearby_request() };
    assert!(req.validate().is_err());
}

#[test]
fn nearby_validate_rejects_out_of_range_longitude() {
    let req = NearbyPostsRequest { longitude: 180.1, ..valid_nearby_request() };
    assert!(req.validate().is_err());
}

#[test]
fn nearby_validate_rejects_non_positive_radius() {
    let req = NearbyPostsRequest { radius: 0.0, ..valid_nearby_request() };
    assert!(req.validate().is_err());

    let req = NearbyPostsRequest { radius: -5.0, ..valid_nearby_request() };
    assert!(req.validate().is_err());
}

#[test]
fn nearby_validate_accepts_valid_request() {
    assert!(valid_nearby_request().validate().is_ok());
}
