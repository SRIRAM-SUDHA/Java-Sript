# PHASE 5 — HTTP, APIs, and Side Effects

## Goal
Make production-grade API calls with `HttpClient`, centralized policies (interceptors), and robust error handling.

## Topics
1. **HttpClient**
   - Typed responses
   - Error handling strategies
2. **HTTP Interceptors**
   - Auth tokens
   - Global error handling
   - Logging
   - Retry logic

## Hands-on (Do This)
- Add an API layer:
  - One service per domain (e.g., `UsersService`, `ItemsService`)
  - Add an interceptor for auth header injection
  - Add an interceptor for consistent error mapping

## Exit Criteria
- Your components do not directly “do HTTP”; they call services/facades.
- You can handle auth and errors without duplicating code.

## Next
- Continue to `../PHASE 6 — Change Detection & Performance/Readme.md`

