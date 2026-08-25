# Rust Backend Engineering Notes (Part 3)

## Project

**Local News App (Rust + Axum + PostgreSQL)**

> This chapter focuses on designing a clean Repository layer, implementing
> CRUD operations, and understanding the responsibilities of each layer.

----------------------------------------------------------------------------

# 61. Why Repositories?

Initially our handlers looked like this:

HTTP

↓

Validation

↓

SQL

↓

Database

↓

JSON Response

One function had multiple responsibilities.

Repositories separate persistence from HTTP.

----------------------------------------------------------------------------

# 62. Responsibility of a Repository

A repository is responsible for:

- Writing SQL
- Executing database queries
- Mapping database rows to Rust structs
- Returning domain-friendly results

A repository is NOT responsible for:

- HTTP
- JSON
- Status Codes
- Authentication
- Sending Emails
- Business Rules

----------------------------------------------------------------------------

# 63. Responsibility of a Handler

A handler is responsible for:

- Receiving HTTP requests
- Extracting request data
- Calling business/database layers
- Returning HTTP responses

Handlers should NOT contain SQL.

----------------------------------------------------------------------------

# 64. Pass the Smallest Dependency

Bad

```rust
create_post(&AppState)
```

Good

```rust
create_post(&PgPool)
```

Rule:

A function should only receive the dependencies it actually needs.

----------------------------------------------------------------------------

# 65. Why Not Pass AppState?

Repository doesn't need:

- HTTP
- Router
- Application State

Repository only needs:

```rust
PgPool
```

Keeping dependencies small makes code easier to reuse and test.

----------------------------------------------------------------------------

# 66. Repository API Design

Repository functions should look like:

```rust
create_post(pool, input)
```

instead of

```rust
create_post(state)
```

----------------------------------------------------------------------------

# 67. GET /posts/{id}

New endpoint:

```
GET /posts/{id}
```

Uses Axum's Path extractor.

```rust
Path(id): Path<i64>
```

Axum automatically converts

```
"15"
```

into

```rust
15_i64
```

before the handler runs.

----------------------------------------------------------------------------

# 68. Path Extractor

```rust
Path(id): Path<i64>
```

means

```
URL

↓

Extract "id"

↓

Convert to i64

↓

Store in id
```

This is another Axum extractor, just like:

```rust
State(...)
Json(...)
```

----------------------------------------------------------------------------

# 69. Extractors

So far we've learned three extractors.

```rust
State(state)
```

Extracts application state.

```rust
Json(input)
```

Extracts and deserializes JSON.

```rust
Path(id)
```

Extracts URL parameters.

----------------------------------------------------------------------------

# 70. Pattern Destructuring

```rust
State(state)

Json(input)

Path(id)
```

These are NOT Axum syntax.

They are Rust pattern matching / destructuring.

Example

```rust
let (x, y) = point;
```

Same concept.

----------------------------------------------------------------------------

# 71. fetch_optional()

We already knew

```rust
fetch_one()
```

Exactly one row.

```rust
fetch_all()
```

Zero or more rows.

New:

```rust
fetch_optional()
```

Returns

```rust
Option<Post>
```

Perfect for primary key lookups.

----------------------------------------------------------------------------

# 72. Result<Option<T>>

Repository returns

```rust
Result<Option<Post>, AppError>
```

Meaning

```
Database failed

↓

Err

Database succeeded

↓

Did row exist?

↓

Some(Post)

or

None
```

Notice that "row not found" is NOT an error.

----------------------------------------------------------------------------

# 73. Why None Isn't an Error

Query

```sql
SELECT ...
WHERE id = 100
```

No row exists.

Database executed successfully.

Therefore

```rust
Ok(None)
```

instead of

```rust
Err(...)
```

----------------------------------------------------------------------------

# 74. Option vs Result

Result answers

```
Did the operation succeed?
```

Option answers

```
Was there actually a value?
```

These are different questions.

----------------------------------------------------------------------------

# 75. Mapping Option to HTTP

Repository returns

```rust
Option<Post>
```

Handler converts

```rust
Some(Post)
```

↓

200 OK

```rust
None
```

↓

404 Not Found

Repository never knows about HTTP.

----------------------------------------------------------------------------

# 76. Designing AppError::NotFound

Instead of

```rust
NotFound
```

we chose

```rust
NotFound(String)
```

Example

```
Post not found

User not found

Comment not found
```

More descriptive.

----------------------------------------------------------------------------

# 77. DELETE Endpoint

DELETE is different from SELECT.

It doesn't return rows.

Instead

```rust
sqlx::query(...)
```

followed by

```rust
.execute(...)
```

----------------------------------------------------------------------------

# 78. execute()

Used when SQL doesn't return rows.

Examples

DELETE

UPDATE

INSERT (without RETURNING)

----------------------------------------------------------------------------

# 79. rows_affected()

After execute()

SQLx returns

```rust
rows_affected()
```

Meaning

```
1

↓

Deleted successfully

0

↓

Nothing matched
```

Perfect for DELETE and UPDATE.

----------------------------------------------------------------------------

# 80. UPDATE Endpoint

Unlike DELETE,

UPDATE needs

```sql
SET
```

Example

```sql
UPDATE posts
SET message = $1
WHERE id = $2
```

----------------------------------------------------------------------------

# 81. Why UPDATE Needs Input

DELETE only needs

```
id
```

UPDATE needs

```
id

+

new values
```

Therefore handler receives

```rust
Json(input)
```

----------------------------------------------------------------------------

# 82. CRUD Completed

Current API

```
POST   /posts

GET    /posts

GET    /posts/{id}

PUT    /posts/{id}

DELETE /posts/{id}
```

----------------------------------------------------------------------------

# 83. Layer Responsibilities

Handler

↓

HTTP

Repository

↓

Database

Future

Service

↓

Business Logic

Each layer has one responsibility.

----------------------------------------------------------------------------

# 84. Future Service Layer

Repository should NEVER call

- Email
- Cache
- AI
- Analytics

Those belong in the Service layer.

Example

```
Handler

↓

Service

↓

Repository

↓

Database
```

----------------------------------------------------------------------------

# 85. Framework vs Application Responsibilities

Framework

- Parse JSON
- Parse URL
- Parse Query Parameters
- Parse Headers

Application

- Validate business rules
- Database operations
- Authentication
- Authorization

----------------------------------------------------------------------------

# Golden Rules (Part 3)

21. Repositories own persistence.
22. Handlers own HTTP.
23. Pass the smallest dependency possible.
24. Repositories never know about HTTP.
25. Services coordinate multiple components.
26. fetch_optional() represents "0 or 1 row."
27. Result answers "Did it work?"
28. Option answers "Was there a value?"
29. execute() is for SQL that doesn't return rows.
30. rows_affected() tells us whether UPDATE/DELETE actually changed data.
31. Pattern matching is everywhere in Rust.
32. Axum extractors are just Rust destructuring.
33. Let the framework solve framework problems.
34. Keep SQL inside repositories.

----------------------------------------------------------------------------

# Concepts Mastered

✓ Repository Pattern

✓ Separation of Concerns

✓ Path Extractor

✓ Pattern Destructuring

✓ fetch_optional()

✓ Result<Option<T>>

✓ execute()

✓ rows_affected()

✓ DELETE

✓ UPDATE

✓ CRUD Architecture

✓ Layer Responsibilities

✓ Framework Responsibilities

✓ Dependency Minimization