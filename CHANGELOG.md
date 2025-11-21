# Changelog

## [v1.0.1] - Authentication, AI, and Infrastructure Improvements

### Deployed Links

#### **Frontend**

-   **URL:** _https://virallens-assignment-main.vercel.app/_

#### **Backend**

-   **URL:** _https://virallens-assignment-main-production.up.railway.app/_

### Added

-   Secure authentication system using **HTTP-only cookies**.
-   Password hashing using **bcrypt**.
-   React Markdown renderer for formatted LLM responses.
-   Automatic conversation title generation using first user + assistant messages.
-   Type-safe models for **User**, **Message**, and **Conversation** on both server and client.
-   Docker `env_file` support for cleaner environment configuration.

### Changed

-   Replaced localStorage token auth with cookie-based authentication.
-   Updated `authenticateToken` middleware to extract JWT from cookies.
-   Updated client API calls to use `credentials: "include"` for cookie handling.
-   Improved CORS configuration to properly support cross-origin cookies.
-   Updated system prompt to enforce responses in English only.
-   Refactored chat API to no longer depend on token headers.
-   Replaced original background image to compressed webp format

### Removed

-   Storing JWT tokens in `localStorage`.
-   Password field from all response objects.
-   Old prompt rule preventing repeated messages.

### Future Scope

-   Real-time conversation title updates in the sidebar.
-   Redis caching layer for improved chat history performance.
