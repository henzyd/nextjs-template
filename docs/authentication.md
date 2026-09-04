# Authentication

## Security model

The browser receives a short-lived access token and keeps it only in module
memory. `setAccessToken` also mirrors it into the authenticated Axios default
header. A reload clears both copies.

The external backend's long-lived credential is held only in the `app_auth`
cookie by default. Route Handlers create it with `httpOnly`, `sameSite: "lax"`,
path `/`, and `secure` in production. Client modules cannot read it. Override
the name with the server-only `AUTH_COOKIE_NAME` variable.

No auth bridge response includes the long-lived credential.

## Lifecycle

### Login

The browser posts `LoginInput` to `POST /api/auth/login`. The handler forwards
the JSON body to `POST /auth/login` on `API_BASE_URL`, removes the long-lived
credential from the backend response, writes the cookie, and returns only the
access token and user. The login hook puts the user under `auth.me` and marks
the session authenticated.

### Reload restoration

`SessionProvider` mounts once beneath the query provider. It posts to
`/api/auth/refresh`, restores the access token, then prefetches `GET /auth/me`
through the authenticated Axios client. Concurrent development mounts share
one bootstrap promise.

### Authenticated requests and expiry

The private Axios request interceptor reads the in-memory token for every
request. On `401`, the response interceptor marks the request, starts or joins
one refresh promise, updates the token, and retries exactly once. A second
`401` or failed refresh clears the token and auth cache, asks the logout bridge
to remove the cookie, and redirects to login with a validated local return
path. External, protocol-relative, and backslash-based destinations are
rejected.

### Logout

`POST /api/auth/logout` sends a best-effort revocation request to the backend
and always deletes the HTTP-only cookie. Client cleanup runs even if that call
fails: token, session state, and auth queries are cleared before navigation.

### Google OAuth

Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` only after configuring the backend.
The browser navigates to `/api/auth/google`, which redirects to the backend's
OAuth initiation endpoint. The backend owns provider state and authorization.
The provider must return a `code` to `/api/auth/google/callback`; that handler
posts the code to the exchange endpoint, writes the returned long-lived
credential, and redirects to the app. Session bootstrap then obtains a fresh
access token. The template does not invent provider state or credentials.

## Required backend contract

All JSON errors should use `{ "message": "..." }` and an appropriate HTTP
status. Request and successful response bodies are:

| Operation                        | Request                                     | Successful response                   |
| -------------------------------- | ------------------------------------------- | ------------------------------------- |
| `POST /auth/signup`              | `{ firstName, lastName?, email, password }` | `{ message }`                         |
| `POST /auth/verify-email`        | `{ token }`                                 | `{ message }`                         |
| `POST /auth/resend-verification` | `{ email }`                                 | `{ message }`                         |
| `POST /auth/login`               | `{ email, password }`                       | `{ accessToken, user, refreshToken }` |
| `POST /auth/refresh`             | `{ refreshToken }`                          | `{ accessToken, refreshToken? }`      |
| `POST /auth/logout`              | `{ refreshToken }`                          | Any successful JSON body              |
| `GET /auth/me`                   | `Authorization: Bearer <accessToken>`       | `UserProfile`                         |
| `POST /auth/forgot-password`     | `{ email }`                                 | `{ message }`                         |
| `POST /auth/reset-password`      | `{ token, password }`                       | `{ message }`                         |
| `GET /auth/google`               | Browser navigation                          | Provider redirect                     |
| `POST /auth/google/exchange`     | `{ code }`                                  | `{ refreshToken }`                    |

`UserProfile` requires `id`, `email`, `firstName`, and nullable `lastName`;
`role` and `status` are optional. For compatibility with the extracted flow,
the bridge accepts `authToken` as an alias for the long-lived
`refreshToken`. Both names are stripped before any response reaches browser
code. Change the alias deliberately if the real backend differs.

The template has no authentication backend. A successful runtime flow depends
on implementing and configuring this contract.
