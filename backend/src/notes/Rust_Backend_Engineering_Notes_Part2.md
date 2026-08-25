# Rust Backend Engineering Notes (Part 2)

## Project

**Local News App (Rust + Axum + Tokio + PostgreSQL)**

> Continuation of Part 1. These notes cover the concepts learned while
> migrating the backend from in-memory storage to PostgreSQL.

------------------------------------------------------------------------

# 40. PostgreSQL

PostgreSQL is responsible for persistent storage.

Unlike `Vec<Post>`, data survives application restarts.

------------------------------------------------------------------------

# 41. Why move from `Vec<Post>` to PostgreSQL?

`Vec<Post>`

-   Exists only while the server is running.
-   Cannot be shared across multiple application instances.
-   Loses all data after restart.

PostgreSQL provides:

-   Persistent storage
-   Concurrent access
-   Transactions
-   Querying

------------------------------------------------------------------------

# 42. PgPool

``` rust
pub struct AppState {
    pub db: PgPool,
}
```

A `PgPool` manages reusable database connections.

Instead of creating a new connection for every request, handlers borrow
a connection from the pool.

------------------------------------------------------------------------

# 43. Why Connection Pools?

Without a pool:

    Request
       ↓
    Open DB Connection
       ↓
    Execute Query
       ↓
    Close Connection

With a pool:

    Request
       ↓
    Borrow Connection
       ↓
    Execute Query
       ↓
    Return Connection

Opening database connections is expensive.

------------------------------------------------------------------------

# 44. SQLx

SQLx is a SQL-first Rust database library.

Instead of hiding SQL, SQLx encourages writing real SQL.

------------------------------------------------------------------------

# 45. `query()` vs `query_as()`

`query()`

-   Returns generic database rows.

`query_as()`

-   Maps rows directly into Rust structs.

``` rust
query_as::<_, Post>(...)
```

Meaning:

    Database Row
          ↓
     FromRow
          ↓
       Post

------------------------------------------------------------------------

# 46. `FromRow`

``` rust
#[derive(FromRow)]
```

Allows SQLx to construct a Rust struct from a database row.

------------------------------------------------------------------------

# 47. `bind()`

``` rust
.bind(value)
```

instead of string formatting.

Benefits:

-   Prevents SQL Injection
-   Type safe
-   Cleaner SQL

------------------------------------------------------------------------

# 48. `RETURNING`

``` sql
INSERT INTO posts (...)
VALUES (...)
RETURNING id, user_id, message;
```

PostgreSQL generates the ID and returns the inserted row.

------------------------------------------------------------------------

# 49. `fetch_one()`

Used when exactly one row is expected.

Later:

-   fetch_all()
-   fetch_optional()
-   execute()

------------------------------------------------------------------------

# 50. Why PostgreSQL should generate IDs

The database owns primary key generation.

The application should not invent IDs.

------------------------------------------------------------------------

# 51. SQL Migrations

Schema changes are versioned.

Every schema modification should be a new migration.

------------------------------------------------------------------------

# 52. Never modify applied migrations

Applied migrations are history.

Instead:

    Migration 1
          ↓
    Migration 2
          ↓
    Migration 3

------------------------------------------------------------------------

# 53. `CreatePost::validate()`

Validation moved from `Post::new()` to:

``` rust
impl CreatePost {
    pub fn validate(&self) -> Result<(), String>
}
```

Reason:

The incoming request should validate itself.

------------------------------------------------------------------------

# 54. Why validation belongs to `CreatePost`

`CreatePost`

↓

Represents client input.

`Post`

↓

Represents stored data.

Different responsibilities.

------------------------------------------------------------------------

# 55. Choosing `self`

`&self`

-   Read only

`&mut self`

-   Modify object

`self`

-   Consume ownership

Rule:

Choose the weakest receiver possible.

------------------------------------------------------------------------

# 56. Avoid `unwrap()` in request handlers

Instead of

``` rust
.unwrap()
```

use

``` rust
.map_err(|_| AppError::DatabaseError)?
```

Request handlers should return errors instead of panicking.

------------------------------------------------------------------------

# 57. `map_err()`

Transforms

    Old Error
        ↓
    New Error

Example:

    sqlx::Error
          ↓
    AppError

------------------------------------------------------------------------

# 58. `DatabaseError`

Represents database failures without exposing internal SQL details to
the client.

------------------------------------------------------------------------

# 59. Enum variants as constructors

``` rust
enum AppError {
    BadRequest(String),
    DatabaseError,
}
```

-   `BadRequest` behaves like `fn(String) -> AppError`
-   `DatabaseError` is a value.

Example:

``` rust
enum Color {
    Red,
    Rgb(u8, u8, u8),
}
```

-   `Color::Red` → value
-   `Color::Rgb` → constructor/function

------------------------------------------------------------------------

# Golden Rules (Part 2)

11. PostgreSQL owns persistence.
12. Rust owns business logic.
13. Never edit an applied migration.
14. Validation belongs to the request model.
15. `query_as()` maps SQL rows into Rust structs.
16. Use `bind()` instead of string formatting.
17. Never `unwrap()` inside request handlers.
18. Prefer the weakest receiver (`&self` → `&mut self` → `self`).
19. Treat database failures as expected runtime errors.
20. Add abstractions only when they solve a real problem.

------------------------------------------------------------------------

# Concepts Mastered

-   PgPool
-   SQLx
-   query_as()
-   FromRow
-   bind()
-   RETURNING
-   fetch_one()
-   SQL Migrations
-   map_err()
-   CreatePost validation
-   Enum variants as constructors
