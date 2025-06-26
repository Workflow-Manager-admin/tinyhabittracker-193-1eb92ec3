# tinyhabittracker-193-1eb92ec3

## Auth/CORS/JWT Security for Deployment

- Set a strong `JWT_SECRET` in your backend `.env` file for correct cryptographic security.
- Set `FRONTEND_ORIGIN=http://localhost:3000` (or your deployment frontend URL) in your backend `.env` file to allow CORS for secure cookie-based auth from browser.
- The backend sets JWT tokens in HTTP-only, SameSite-lax cookies with Secure flag in production.
- The frontend must use `credentials: "include"` for all authenticated requests.
- Ensure that browsers block cross-origin cookies by default unless CORS origin is correctly configured.

### Quickstart
- Add a `.env` file to your mini_habbit_backend with at minimum:

  ```
  JWT_SECRET=yourSuperSecretValue
  FRONTEND_ORIGIN=http://localhost:3000
  ```
