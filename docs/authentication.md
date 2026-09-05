# Authentication

## Security boundary

The browser receives a short-lived access token and keeps it only in module
memory. `setAccessToken` mirrors it into the authenticated Axios default header.
A reload clears both copies.

The external backend's long-lived credential is stored only in the server-managed
`app_auth` cookie by default. Route Handlers create it with `httpOnly`,
`sameSite: "lax"`, path `/`, and `secure` in production. Client modules cannot
read it. `AUTH_COOKIE_NAME` may override the name on the server. No bridge response
returns the long-lived credential.

## Live lifecycle

1. Login posts credentials to `/api/auth/login`. The Route Handler calls the
   backend, strips `refreshToken`/`authToken`, stores that value in the HTTP-only
   cookie, and returns only the access token and safe user data.
2. `SessionProvider` calls `/api/auth/refresh` once after hydration, restores the
   access token, then fills the `auth.me` query through `AuthService.getMe`.
3. The private Axios client reads the in-memory access token for each request.
   Concurrent `401` responses join one refresh promise; each original request is
   retried at most once.
4. Failed refresh clears memory and auth queries, calls the logout bridge to
   revoke/delete the cookie, and redirects to a validated local login path.
5. Explicit logout performs the same client cleanup even if backend revocation
   fails. External, protocol-relative, and backslash-based return paths are
   rejected.

Google OAuth is hidden unless `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`. The backend
owns provider state and authorization. Its callback supplies a code to the Next
Route Handler, which exchanges it server-side and writes only the HTTP-only
credential.

## Demo lifecycle

`NEXT_PUBLIC_DEMO_MODE=true` swaps every retained `AuthService` operation for the
typed adapter in `features/auth/demo.ts`. It uses deterministic `.test` data and a
synthetic access value in module memory only. It never calls live endpoints,
creates an auth cookie, or weakens the production Route Handlers. OAuth controls
are disabled in demo mode. The adapter is for UI development and demonstrations,
not authentication security.

Future feature demos belong beside their service and must keep the same public
return type as the live method. The shared `lib/utils/demo.ts` contains only the
flag accessor and delay mechanic.

## Required backend contract

| Operation                        | Request                                     | Successful response                   |
| -------------------------------- | ------------------------------------------- | ------------------------------------- |
| `POST /auth/signup`              | `{ firstName, lastName?, email, password }` | `{ message }`                         |
| `POST /auth/verify-email`        | `{ token }`                                 | `{ message }`                         |
| `POST /auth/resend-verification` | `{ email }`                                 | `{ message }`                         |
| `POST /auth/login`               | `{ email, password }`                       | `{ accessToken, user, refreshToken }` |
| `POST /auth/refresh`             | `{ refreshToken }`                          | `{ accessToken, refreshToken? }`      |
| `POST /auth/logout`              | `{ refreshToken }`                          | Any successful JSON body              |
| `GET /auth/me`                   | bearer access token                         | `UserProfile`                         |
| `POST /auth/forgot-password`     | `{ email }`                                 | `{ message }`                         |
| `POST /auth/reset-password`      | `{ token, password }`                       | `{ message }`                         |
| `POST /auth/google/exchange`     | `{ code }`                                  | `{ refreshToken }`                    |

`UserProfile` requires `id`, `email`, `firstName`, and nullable `lastName`;
`role` and `status` are optional. The bridge accepts `authToken` as a deliberate
legacy alias for `refreshToken` and strips both names from browser responses.
