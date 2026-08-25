# Chapter 4 — Introducing Geolocation (Aug 18 2026)

## Motivation

Our Local News App revolves around **location-based posts**. A post without a location cannot be:

- Displayed on a map
- Queried by nearby users
- Clustered
- Used for duplicate detection
- Ranked by local relevance

To support future geospatial features, we first needed to introduce location into our domain model and database.

---

# Problem

Originally, a post only contained:

```rust
CreatePost {
    user_id,
    message,
}
```

The database schema was:

```
posts

id
user_id
message
```

There was no concept of where a post occurred.

---

# Design Review

## Question

How should we represent a location?

### Option A

```rust
pub latitude: f64,
pub longitude: f64,
```

### Option B

```rust
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
}
```

### Decision

Use a dedicated `Location` struct inside `CreatePost`.

```rust
pub struct CreatePost {
    pub user_id: i64,
    pub message: String,
    pub location: Location,
}
```

Reason:

Location is a single domain concept.

Future functionality such as:

- validation
- distance calculation
- coordinate conversion

can naturally belong inside `Location`.

---

# Why is Post still flat?

Instead of

```rust
Post {
    location: Location,
}
```

we currently use

```rust
Post {
    latitude: f64,
    longitude: f64,
}
```

Reason:

`Post` is populated directly from SQLx using

```rust
#[derive(sqlx::FromRow)]
```

SQLx maps database columns directly into struct fields.

Keeping the struct flat makes mapping simple.

Later, when introducing PostGIS or custom mappings, `Post` can also use `Location`.

---

# Validation

Location validation ensures only valid geographic coordinates are stored.

Latitude

```
-90 ≤ latitude ≤ 90
```

Longitude

```
-180 ≤ longitude ≤ 180
```

Implementation

```rust
if !(-90.0..=90.0).contains(&self.location.latitude) {
    return Err("Invalid latitude".to_string());
}

if !(-180.0..=180.0).contains(&self.location.longitude) {
    return Err("Invalid longitude".to_string());
}
```

---

# Rust Range Syntax

Inclusive range

```rust
-90.0..=90.0
```

means

```
-90

...

90
```

The ending value is included.

Without `=`

```rust
-90.0..90.0
```

90 itself would be invalid.

---

# Database Migration

Added two new columns.

```sql
ALTER TABLE posts
    ADD COLUMN latitude DOUBLE PRECISION NOT NULL,
    ADD COLUMN longitude DOUBLE PRECISION NOT NULL;
```

---

# Migration Design Discussion

Production systems usually contain existing rows.

Adding

```sql
NOT NULL
```

requires values for existing records.

Possible approaches:

1. Allow NULL initially
2. Provide DEFAULT values
3. Use NOT NULL only if the table is empty

For this learning project we chose Option 3 because the database only contained temporary test data.

---

# Rust ↔ PostgreSQL Type Mapping

Rust types are different from PostgreSQL types.

SQLx performs the conversion.

| Rust | PostgreSQL |
|------|------------|
| i32 | INTEGER |
| i64 | BIGINT |
| String | TEXT |
| bool | BOOLEAN |
| f64 | DOUBLE PRECISION |

Example

```rust
i64
```

↓

```sql
BIGINT
```

---

# Updating Repository Queries

After adding new columns, every SQL query had to be updated.

Create

```sql
INSERT INTO posts
(
    user_id,
    message,
    latitude,
    longitude
)
```

Retrieve

```sql
SELECT
    id,
    user_id,
    message,
    latitude,
    longitude
```

Schema changes should always be reflected in:

- migrations
- Rust structs
- repository queries
- API requests
- tests

---

# End-to-End Testing

Used Postman to verify:

✓ POST /posts

✓ GET /posts

Tested validation using:

```json
{
    "user_id": 1,
    "message": "My friend is marrying",
    "location": {
        "latitude": -4500.6062,
        "longitude": -12.3321
    }
}
```

Received

```
Invalid latitude
```

confirming validation occurs before reaching the database.

---

# Request Flow

```
Postman

↓

Axum

↓

Handler

↓

Service

↓

Location Validation

↓

Repository

↓

PostgreSQL

↓

Response
```

Invalid requests stop at the validation layer.

No database query is executed.

---

# Common Mistakes

❌ Forgetting to update repository SQL after changing the schema.

❌ Adding `NOT NULL` columns without considering existing rows.

❌ Assuming SQL and Rust use the same primitive types.

❌ Forgetting to include new fields in `RETURNING`.

---

# Engineering Insights

- Group related data into domain objects (`Location`) rather than passing unrelated primitives.
- Validation should reject invalid data before any database interaction.
- Schema changes ripple through the entire application—not just the database.
- SQLx bridges Rust types and PostgreSQL types through automatic type mapping.
- Design domain models around business concepts, not just database columns.

---

# Golden Rules

1. Model business concepts explicitly.
2. Validate data before persistence.
3. Every schema change affects multiple layers.
4. PostgreSQL types and Rust types are different; SQLx performs the mapping.
5. Repository queries must stay consistent with the database schema.

---

# Concepts Mastered

✓ Domain Modeling

✓ Nested Structs

✓ Location Validation

✓ Rust Range Syntax

✓ Database Migrations

✓ PostgreSQL Type System

✓ Rust ↔ PostgreSQL Type Mapping

✓ Schema Evolution

✓ Repository Refactoring

✓ End-to-End API Testing
