# Rust Backend Engineering Notes (Part 1)

## Project

**Local News App (Rust + Axum + Tokio)**

> These notes summarize the concepts learned while building the project.
> They are intended to grow over time into a complete Rust backend
> handbook.

------------------------------------------------------------------------

# 1. Backend Responsibilities

-   Receive HTTP requests
-   Execute business logic
-   Read/write data
-   Return HTTP responses

Flow:

``` text
Client -> HTTP Request -> Backend -> Business Logic -> Database -> HTTP Response -> Client
```

# 2. Axum

-   Rust web framework
-   Maps URLs to handler functions
-   Handles request/response extraction and routing

# 3. Tokio

-   Async runtime
-   Schedules asynchronous tasks
-   Allows many concurrent requests without blocking threads

# 4. Why `async fn main()`

Network, file and database operations take time.

`await` pauses only the current async task---not the whole program.

# 5. `await`

-   Suspends current async task
-   Lets Tokio run other tasks
-   Resumes when operation completes

# 6. `unwrap()`

Used with `Result<T, E>` or `Option<T>`.

-   `Ok` / `Some` → returns value
-   `Err` / `None` → panic

# 7. `&'static str`

-   `&` → borrowed reference
-   `'static` → lives for entire program
-   `str` → string slice

String literals like `"Hello"` are `&'static str`.

# 8. Server Startup Flow

``` text
Program
  ↓
main()
  ↓
Create AppState
  ↓
Build Router
  ↓
Bind Listener
  ↓
Start Axum Server
  ↓
Receive Requests
```

# 9. Route vs Handler

Route:

    GET /posts

Handler:

``` rust
async fn get_posts(...)
```

A route maps an HTTP path + method to a handler.

# 10. HTTP Methods

-   GET → Read
-   POST → Create
-   PUT → Replace
-   PATCH → Partial Update
-   DELETE → Delete

# 11. Why not a normal Vec?

A local variable in `main()` is owned by `main()`.

Handlers cannot access it directly.

# 12. Why not a global variable?

Global mutable state causes race conditions.

Rust encourages explicit shared state instead.

# 13. AppState

``` rust
struct AppState {
    posts: Mutex<Vec<Post>>,
}
```

Stores shared application resources: - posts - database pool (future) -
cache - AI client

# 14. Blueprint vs Instance

Definition:

``` rust
struct AppState { ... }
```

Instance:

``` rust
let state = AppState { ... };
```

# 15. Why create AppState in `main()`

-   Lives for application lifetime
-   Dependency Injection
-   Easy to replace during tests

# 16. Arc

Purpose: - Shared ownership

Arc creates multiple ownership handles to the same object.

# 17. Mutex

Purpose: - Protect shared mutable data

Only one thread/task can hold the lock at a time.

# 18. Arc vs Mutex

-   Arc → Who owns it?
-   Mutex → Who may access it now?

# 19. `lock()`

Returns:

``` rust
Result<MutexGuard<T>, PoisonError>
```

# 20. Why `lock().unwrap()`

`lock()` returns a `Result`.

`unwrap()` extracts the successful value.

# 21. MutexGuard

Represents: - Lock - Permission - Access to protected value

When dropped, the lock is released automatically (RAII).

# 22. No `unlock()`

Rust releases the lock automatically when `MutexGuard` goes out of
scope.

# 23. Dereferencing (`*`)

`MutexGuard<u64>` is not a `u64`.

``` rust
*next_id
```

Accesses the value inside the guard.

# 24. Why `*next_id += 1`

Operators work on the underlying value, not on `MutexGuard`.

# 25. Why `let id = *next_id`

Without `*`: - Type = `MutexGuard<u64>`

With `*`: - Type = `u64`

# 26. Auto Deref

Method calls automatically dereference:

``` rust
posts.push(post);
```

Equivalent to:

``` rust
(*posts).push(post);
```

Operators do **not** auto-deref.

# 27. Why clone()

`posts.last()` returns `Option<&Post>`.

Clone creates an owned `Post` for the response.

# 28. Option

`last()` returns:

-   `Some(&Post)`
-   `None`

Rust uses `Option` instead of `null`.

# 29. Why clone() in `get_posts()`

Cannot move the vector out of the mutex.

Clone returns a copy while the original remains in AppState.

# 30. Mutex vs RwLock

Mutex: - One accessor

RwLock: - Many readers - One writer

# 31. Current Project Structure

``` text
src/
├── main.rs
├── lib.rs
├── startup.rs
├── state.rs
├── domain/
└── routes/
```

# 32. Binary vs Library Crate

`main.rs` → executable

`lib.rs` → reusable application code

# 33. lib.rs

Public entry point of the library.

# 34. crate::

Means: \> Start from the root of the current library crate.

# 35. backend::

Binary imports its own library using the crate name.

# 36. pub

-   `pub struct` → type visible
-   `pub field` → field visible

# 37. Domain vs Routes

Domain: - Business concepts - Business rules

Routes: - HTTP handling - Request/Response

# 38. startup.rs

Responsible for: - Building Router - Registering routes

# 39. Dependency Injection

`main()` creates dependencies.

`startup.rs` receives them.

# Golden Rules

1.  Arc shares ownership.
2.  Mutex protects shared mutable data.
3.  MutexGuard releases lock when dropped.
4.  Methods auto-deref; operators don't.
5.  `unwrap()` extracts values or panics.
6.  `main.rs` wires dependencies.
7.  `startup.rs` builds the application.
8.  Routes handle HTTP.
9.  Domain owns business concepts.
10. Add architecture only when it solves a real problem.
